import { message } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detachCharacter, selectCharacter } from '../../../_actions/characterSelected_actions';
import { useConstructor } from '../useConstructor';
import Character from './Character';
import CharacterInfoDisplay from './CharacterInfoDisplay/CharacterInfoDisplay';
import './CharacterModal.css';

function CharacterModal({ GameCharacterList, setName }) {
  const dispatch = useDispatch();
  const CharacterList = useSelector(state => state.character.CharacterList)
  // const onClick_detachCharacter = () => {
  //   dispatch(detachCharacter());
  // }

  const currentCharacter = useSelector((state) => state.character);
  useConstructor(()=>{console.log("WORK******"); dispatch(detachCharacter())})

  const [isAdded, setIsAdded] = useState(false);

  // useEffect(() => {
  //   let flag = 0;
  //   for (let i = 0; i < CharacterList?.length; i++) {
  //     if (CharacterList[i]?.index === currentCharacter?.characterSelected?.index) {
  //       flag = 1;
  //       break;
  //     }
  //   }
  //   if (flag === 1) {
  //     setIsAdded(true);
  //   } else {
  //     setIsAdded(false);
  //   }
    
  // }, [currentCharacter, CharacterList])

  // useEffect(() => {
  //   dispatch(selectCharacter(GameCharacterList[currentCharacter?.characterSelected?.index]))
  // }, [GameCharacterList])

  return (
    <div>
      <div className="modal">
        {/* <div onClick={onClick_detachCharacter}>캐릭터 선택 해제</div> */}
        <CharacterInfoDisplay
          setName={setName}
          GameCharacterList={GameCharacterList}
          character={GameCharacterList[currentCharacter?.characterSelected?.index] || currentCharacter.characterSelected}
        />
        {/* {isAdded && <div onClick={onClick_removeCharacter}>삭제</div>} */}
      </div>
    </div>
  )
}

export default memo(CharacterModal)
