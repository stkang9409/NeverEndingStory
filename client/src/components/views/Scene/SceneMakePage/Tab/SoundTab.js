import React, { useEffect, useState } from "react";
import { message } from "antd";
import MyDropzone from "../../../Dropzone/MyDropzone";
import "../EssetModal.css";
import "./MusicTab.css";
import AssetLibraryModal from "../AssetLibraryModal"

function SoundTab({ gameDetail, setFileQueue, setTypeQueue, setSoundBlobList, soundBlobList, setSoundBlobNames, soundBlobNames, blobAssetList, assetUsedFlag }) {
    const [LibraryModalVisible, setLibraryModalVisible] = useState(false)

    const [soundCards, setSoundCards] = useState([]);
    const [blobCards, setBlobCards] = useState([]);

    const onDrop = (files) => {
        for (var i = 0; i < files.length; i++) {
            if (!files[i]) {
                message.error("10MB 이하의 음원 파일을 업로드해주세요.");
                return;
            }
            setFileQueue(oldArray => [...oldArray, files[i]])
            setTypeQueue(oldArray => [...oldArray, 3])
            setSoundBlobNames(oldArray => [...oldArray, files[i]])
            setSoundBlobList(oldArray => [...oldArray, URL.createObjectURL(files[i])])
        }
    };

    // 왜 인자로 넘어온 game이 처음에 존재하지 않는지 모르겠음
    useEffect(() => {
        if (gameDetail.sound)
            setSoundCards(gameDetail.sound.map((element, index) => {
                return (
                    <div className="bgmTab_text_box" key={index}>
                        {element.name}
                    </div>
                )
            }))
    }, [gameDetail]);

    useEffect(() => {
        if (soundBlobList)
            setBlobCards(soundBlobList.map((element, index) => {
                return (
                    <div className="bgmTab_text_box" key={index}>
                        {element.name || soundBlobNames[index].name}
                    </div>
                )
            }))
    }, [soundBlobList]);

    return (
        <div className="bgmTab_container">
            <div className="bgmTab_library"
                onClick={() => setLibraryModalVisible(true)}>
                스토어에서 불러오기
                </div>
            <AssetLibraryModal
                visible={LibraryModalVisible}
                setVisible={setLibraryModalVisible}
                assetType="sound"
                assetUsedFlag={assetUsedFlag}
                setBlob={setSoundBlobList}
                blobAssetList={blobAssetList}
            />
            <div className="bgmTab_dropzone">
                <MyDropzone
                    onDrop={onDrop}
                    multiple={true}
                    maxSize={10485761} // 10MB + 1
                    accept="audio/*"
                    type="sound"
                    icon="audio"
                >
                </MyDropzone>
            </div>
            <div className="bgmTab_Box">
                {soundCards !== 0 && <div>{soundCards}</div>}
                {blobCards !== 0 && <div>{blobCards}</div>}
            </div>
        </div>
    );
}

export default SoundTab;
