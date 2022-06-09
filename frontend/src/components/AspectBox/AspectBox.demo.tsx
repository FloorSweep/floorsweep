import Demo, {SubDemo} from "../Demo/Demo";
import {AspectBox} from "./AspectBox";
import {css} from "../../helpers/css";

const AspectBoxDemo = () => {
    const demoAspects = [
        {width: 100, height: 100},
        {width: 1280, height: 720},
        {width: 1920, height: 1080}
    ]
    return <Demo title={"Aspect Box"}>
        {demoAspects.map(aspect => {
            const aspectRatio = aspect.width / aspect.height
            return <SubDemo title={`${Math.round(aspectRatio * 1000) / 1000}:1`}>
                <div className={css("border-2", "border-dotted", "border-zz-50")}>
                    <AspectBox width={aspect.width} height={aspect.height}/>
                </div>
            </SubDemo>
        })}
    </Demo>
}

export default AspectBoxDemo
