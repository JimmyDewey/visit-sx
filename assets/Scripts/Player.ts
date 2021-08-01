
import { _decorator, Component, Node, RigidBody, Vec3 } from 'cc';
import { JoyStick } from './JoyStick';
const { ccclass, property } = _decorator;

const tempVec3 = new Vec3();


@ccclass('Player')
export class Player extends Component {

    @property({
        type: RigidBody
    })
    rigidBody: RigidBody | null = null;

    @property({
        type: JoyStick
    })
    joyStick: JoyStick | null = null;

    @property({
        type: Node
    })
    camera: Node | null = null;


    start() {
        // [3]
    }

    update(deltaTime: number) {
        if (this.joyStick) {
            this.rigidBody?.setLinearVelocity(this.joyStick.speed);
            console.log(this.joyStick.angleY);
            tempVec3.set(this.node.eulerAngles);
            tempVec3.y = this.joyStick.angleY;
            this.node.eulerAngles = tempVec3;
        }
    }
}