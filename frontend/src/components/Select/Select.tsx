import * as RadixSelect from "@radix-ui/react-select"
import {css} from "../../helpers/css";
import Icon from "../Icon/Icon";

export type SelectItem = { name: string, id: string }

export enum SelectVariant {
    Light = "light",
    Dark = "dark"
}

export interface SelectProps {
    items: SelectItem[];
    value: string;
    onChange: (value: string) => void;
    defaultValue?: string;
    block?: boolean;
    variant?: SelectVariant
    className?: string;
}

const Select = ({items, value, onChange, defaultValue, block = false, variant = SelectVariant.Light, className}: SelectProps) => {
    const initialValue = defaultValue ? defaultValue : items[0].id
    return <div>
        <RadixSelect.Root
            onValueChange={(value) => onChange(value)}
            value={value}
            defaultValue={initialValue}
        >
            <RadixSelect.Trigger className={css("inline-flex", "items-center", "justify-between", "px-2", "py-1", className, {
                "w-full": block,
                "bg-neutral-900": variant === SelectVariant.Light,
                "bg-black": variant === SelectVariant.Dark,
            })}>
                <RadixSelect.Value/>
                <RadixSelect.Icon className={css("ml-2")}>
                    <Icon icon={'chevron-down'}/>
                </RadixSelect.Icon>
            </RadixSelect.Trigger>

            <RadixSelect.Content className={css("overflow-hidden", "text-white", "font-mono", "text-lg", {
                "bg-neutral-700": variant === SelectVariant.Light,
                "bg-black": variant === SelectVariant.Dark
            })}>
                <RadixSelect.Viewport className={css("p-2")}>
                    <RadixSelect.Group>
                        {items.map(item => <RadixSelect.Item
                            key={`select-${item.id}`}
                            value={item.id}
                            className={css("relative", "cursor-pointer", "hover-hover:hover:underline")}
                        >
                            <RadixSelect.ItemText>
                                {item.name}
                            </RadixSelect.ItemText>
                            <RadixSelect.ItemIndicator/>
                        </RadixSelect.Item>)}
                    </RadixSelect.Group>

                    <RadixSelect.Separator/>
                </RadixSelect.Viewport>
                <RadixSelect.ScrollDownButton/>
            </RadixSelect.Content>
        </RadixSelect.Root>
    </div>
}

export default Select
