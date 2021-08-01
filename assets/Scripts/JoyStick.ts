import { _decorator, Component, Node, systemEvent, SystemEventType, Touch, EventTouch, Vec2, Vec3, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

const TOUCH_RADIUS_LIMIT = 400;

const tempVec2 = new Vec2();
const tempVec3 = new Vec3();
const HORIZONTAL = new Vec2(1, 0);
const VERTICAL = new Vec2(0, 1);
const PLAYER_MOVE_FRAME = 0.04;

@ccclass('JoyStick')
export class JoyStick extends Component {

    @property({
        type: Node
    })
    player: Node | null = null;

    @property({
        type: Node
    })
    camera: Node | null = null;

    private _startTouchPos = new Vec2();
    private _touchPos = new Vec2();
    private _isTouch = false;
    private _cameraDelta = new Vec3();

    private _pos = new Vec3();

    private _directionX = 0;
    private _directionZ = 0;

    speed = new Vec3();
    angleY = 0;

    onEnable() {
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.on(SystemEventType.TOUCH_MOVE, this.onTouchMove, this);
        systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this);
        this._pos = this.node.getWorldPosition();
    }

    start() {
        if (this.player && this.camera) {
            Vec3.subtract(this._cameraDelta, this.camera.worldPosition, this.player.worldPosition);
        }
    }

    update(deltaTime: number) {
        if (this._isTouch) {
            tempVec3.set(0, 0, 0);
            tempVec3.x = PLAYER_MOVE_FRAME * this._directionX;
            tempVec3.z = PLAYER_MOVE_FRAME * this._directionZ;
            if (this.player) {
                if (this.camera) {
                    Vec3.add(tempVec3, this.player.worldPosition, this._cameraDelta);
                    this.camera.worldPosition = tempVec3;
                }
            }
        }
    }

    onDisable() {
        systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.off(SystemEventType.TOUCH_MOVE, this.onTouchMove, this);
        systemEvent.off(SystemEventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(touch: Touch, event: EventTouch) {
        this._isTouch = true;
        const touchPos = touch.getUILocation(this._startTouchPos);
        tempVec3.set(touchPos.x, touchPos.y, 0);
        if (touchPos.length() < TOUCH_RADIUS_LIMIT) {
            this.node.setWorldPosition(tempVec3);
        }
    }

    onTouchMove(touch: Touch, event: EventTouch) {
        const touchPos = touch.getUILocation(this._touchPos);
        Vec2.subtract(tempVec2, this._touchPos, this._startTouchPos);

        this._directionX = Math.sign(tempVec2.x);
        this._directionZ = Math.sign(tempVec2.y);
        const radian = tempVec2.angle(VERTICAL);
        // if (this.player) // {
        //     tempVec3.set(this.player.eulerAngles);
        //     console.log(`1===tempVec3: ${tempVec3}`);
        //     // console.log(this.player.getRotation());
        //     tempVec3.y = angle;
        //     this.player.eulerAngles = tempVec3;
        //     // console.log(`2===tempVec3: ${tempVec3}`);
        // }
        this.speed.set(tempVec2.x / 50, 0, -tempVec2.y / 50);
        this.angleY = (radian * 180 / Math.PI) * Math.sign(-tempVec2.x);

        tempVec3.set(touchPos.x, touchPos.y, 0);
        const controlRadian = touchPos.angle(HORIZONTAL);
        if (touchPos.length() > TOUCH_RADIUS_LIMIT) {
            const x = Math.cos(controlRadian) * TOUCH_RADIUS_LIMIT;
            const y = Math.sin(controlRadian) * TOUCH_RADIUS_LIMIT;
            tempVec3.set(x, y, 0);
        }
        this.node.setWorldPosition(tempVec3);
    }

    onTouchEnd(touch: Touch, event: EventTouch) {
        this._isTouch = false;
        this.speed.set(0, 0, 0);
        this.returnJoyStick();
    }

    returnJoyStick() {
        this.node.setWorldPosition(this._pos);
    }
}