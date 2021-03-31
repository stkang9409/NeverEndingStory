import { Button } from 'antd';
import React, { memo, useEffect } from 'react'
import CharacterImg from './CharacterImg'
import './CharacterSideBar.css'


function CharacterSideBar({ gameDetail, setName }) {

  const renderCharacter = gameDetail.character.map((character, index) => {
    return <div className="characterSidebar_box" key={`${index}`}>
      <CharacterImg
        character={character}
        index={index}
        setName={setName} />
    </div>
  })

  return (
    <div>
      <div className="characterSidebar__container">
        {renderCharacter}
      </div>
      <div className="characterSidebar_line">
      </div>
    </div>
  )
}

export default memo(CharacterSideBar)
