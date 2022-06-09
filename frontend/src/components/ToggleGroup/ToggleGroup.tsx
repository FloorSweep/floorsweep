import React, {PropsWithChildren} from "react";
import {ToggleGroup as RadixToggleGroup, ToggleGroupItem as RadixToggleGroupItem} from "@radix-ui/react-toggle-group";
import {css} from "../../helpers/css";
import {Button} from "../index";
import {ButtonVariant} from "../Button/Button";


interface ToggleGroupProps {
    value: string;
    onChange: (val: string) => void;
    items: {value: string, content: React.ReactNode}[];
    variant?: ButtonVariant
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({
    value,
    onChange,
    variant = ButtonVariant.Primary,
    items
}) => {
    return <RadixToggleGroup
        className={css("inline-flex")}
        type={"single"}
        style={{width: "fit-content"}}
        value={value}
        onValueChange={(val) => {
            if (val) {
                onChange(val)
            }
        }}
    >
        {items.map(item => <RadixToggleGroupItem key={`toggle-group-${item.value}`} value={item.value} asChild>
            <Button variant={variant} className={css("h-full")}>
                {item.content}
            </Button>
        </RadixToggleGroupItem>)}
    </RadixToggleGroup>
}

export default ToggleGroup
