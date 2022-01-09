import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from "moment";
import { useSelector, useDispatch } from 'react-redux';

import { 
  fetchAll,
  selectFamilies,
  selectedFamily,
  selectedBoard,
  setFamily,
  setBoard
} from './familySlice';

import {
  fetchBoard,
  selectSelectedWeek
} from '../board/boardSlice';

const NavContainer = styled.div`
  background-color: #efefef;
  margin-bottom: 5px;
  padding-left: 5px;
  width: 100vw;
  height: 50px;
  display: flex;
`

const NavDivider = styled.div`
  margin-left: 5px;
  margin-right: 5px;
  height: 50px;
  border-left: solid 1px black;
`

const NavSelect = styled.select`
  margin-left: 5px;
  margin-right: 5px;
`

const WeekSelector = styled.div`
  display: flex;

  button {
    margin-left: 5px;
    margin-right: 5px;
  }
`

export default function NavBar(props) {
  const dispatch = useDispatch();
  const families = useSelector(selectFamilies);
  const selectedFam = useSelector(selectedFamily);
  const selected_Board = useSelector(selectedBoard);
  const selectedWeek = useSelector(selectSelectedWeek);

  const [loadPage] = useState(0);

  useEffect(() => {
    dispatch(fetchAll())
  }, [loadPage, dispatch]);

  useEffect(() => {
    dispatch(fetchBoard({
      family_id: selectedFam.id,
      board_id: selected_Board.id
    }));
  }, [selected_Board.id, selectedFam.id, dispatch]);

  const familyOptions = families.map(family => <option key={"family_" + family.id} value={family.id}>{family.family_name}</option>);
  const boardOptions = families.length > 0 && selectedFam.boards.map(board => <option key={"board_" + board.id} value={board.id}>{board.board_name}</option>);
  const currentWeek = Object.keys(selectedWeek).length !== 0 && <WeekSelector>
    <button>-</button>
    <p>Week {moment(selectedWeek.week_start_date).format("w YYYY")}</p>
    <button>+</button>
  </WeekSelector>


  console.log("selected family", selectedFam);

  const switchFamily = (id) => {
    var family = families.filter(family => family.id === parseInt(id))[0];
    dispatch(setFamily(family));
  }

  const switchBoard = (id) => {
    console.log("boards", selectedFam.boards);
    console.log("board filter", selectedFam.boards.filter(board => board.id === parseInt(id)));
    selectedFam.boards.forEach(board => {
      console.log(board.id, " === ", id, " ", board.id === id);
    });
    var board = selectedFam.boards.filter(board => board.id === parseInt(id))[0];
    dispatch(setBoard(board));
  }

  return (
    <div>
      <NavContainer>
        <p><b>Meal</b>Board</p>
        <NavDivider/>
        <p>Family:</p>
        <NavSelect value={selectedFam.id} onChange={event => switchFamily(event.target.value)}>
          {familyOptions}
        </NavSelect>
        <NavDivider/>
        <p>Board:</p>
        {selectedFam !== -1 &&
        <NavSelect value={selected_Board.id} onChange={event => switchBoard(event.target.value)}>
          {boardOptions}
        </NavSelect>
        }
        <NavDivider/>
        {currentWeek}
      </NavContainer>
    </div>
  )
}