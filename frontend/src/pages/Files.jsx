import React from "react"
import FileSystem from "src/components/FileSystem"
import { authStore } from "src/store/authStore";
import { useNavigate } from "react-router-dom";

export default function Files() {

    function testOpen(file) {
        console.log(file);
        // TODO Should have a way to seperate images and palettes
        // Set authStore variables paletteId, imageId
        // Do a useNavigate to /paint
        // Make sure the right palette and image is opened
    }

    return <FileSystem mode={null} action={testOpen} onCancel={null}></FileSystem>
}