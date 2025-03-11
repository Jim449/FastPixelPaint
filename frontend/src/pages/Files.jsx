import React from "react"
import FileSystem from "src/components/FileSystem"

export default function Files() {

    function testSave(name, folder) {
        console.log(name);
        console.log(folder);
    }
    // Don't need to save here but do test it out
    return <FileSystem saveMode={true} onSave={testSave} onCancel={null}></FileSystem>
}