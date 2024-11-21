import { CircleDashed, CircleNotch } from "@mynaui/icons-react";
import { LargeP, P, SmallP, TinyP } from "./typography";

export default function Loader() {
    return (
        <div className="flex items-center justify-center gap-1 w-full h-screen text-primary">
            <CircleDashed className="animate-spin" />
            <LargeP>Loading...</LargeP>
        </div>
    )
}