import React from "react"
import FileSystem from "src/components/FileSystem"
import { authStore } from "src/store/authStore";
import { useNavigate } from "react-router-dom";

export default function Files() {

    const setImage = authStore((state) => state.setImage);
    const setPalette = authStore((state) => state.setPalette);
    const navigate = useNavigate();

    function open(file) {
        if (file.type === "Image") {
            setImage(file.id);
            setPalette(file.palette_id);
            navigate("/paint");
        }
        else if (file.type === "Palette") {
            setImage(null);
            setPalette(file.id);
            navigate("/paint");
        }
    }

    return <FileSystem mode={"Open"} action={open} onCancel={null}></FileSystem>
}