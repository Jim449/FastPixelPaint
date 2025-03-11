import React from "react"
import FileSystem from "src/components/FileSystem"

export default function Files() {
    return <FileSystem saveMode={false} onSave={null} onCancel={null}></FileSystem>
}