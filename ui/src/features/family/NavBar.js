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
  clearBoard,
  selectSelectedWeek,
  selectBoard,
  addWeek,
  switchWeek
} from '../board/boardSlice';

const NavContainer = styled.div`
  background-color: #efefef;
  margin-bottom: 5px;
  padding-left: 5px;
  width: calc(100vw - 5px);
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
  const board = useSelector(selectBoard);
  const selectedWeek = useSelector(selectSelectedWeek);

  const [loadPage] = useState(0);

  useEffect(() => {
    dispatch(fetchAll())
  }, [loadPage, dispatch]);

  useEffect(() => {
    if(typeof(selectedFam.id) !== "undefined" && typeof(selected_Board.id) !== "undefined") {
      dispatch(fetchBoard({
        family_id: selectedFam.id,
        board_id: selected_Board.id
      }));
    } else {
      dispatch(clearBoard());
    }
  }, [selected_Board.id, selectedFam.id, dispatch]);

  const gotoPrevWeek = () => {
    // find out if the prev week exists
    var startOfNextWeek = moment(selectedWeek.week_start_date).subtract(7, 'days').format("YYYY-MM-DD");
    console.log("start of prev week is", startOfNextWeek);
    var prevWeek = board.weeks.filter(week => week.week_start_date.startsWith(startOfNextWeek));
    if(prevWeek.length === 0) {
      console.log("no prev week found");
    } else {
      console.log("prev week exists");
      dispatch(switchWeek(prevWeek[0]));
    }
  }

  const gotoNextWeek = () => {
    // find if next week exists already
    var startOfNextWeek = moment(selectedWeek.week_start_date).add(7, 'days').format("YYYY-MM-DD");
    console.log("start of next week is", startOfNextWeek);
    var nextWeek = board.weeks.filter(week => week.week_start_date.startsWith(startOfNextWeek));
    if(nextWeek.length === 0) {
      console.log("no next week found, need to create one");
      dispatch(addWeek({
        family_id: selectedFam.id,
        board_id: board.id,
        week_start_date: startOfNextWeek + "T00:00:00"
      }));
    } else {
      console.log("next week already exists");
      dispatch(switchWeek(nextWeek[0]));
    }
  }

  const gotoThisWeek = () => {
    // determine the date of the Monday of the current week
    var now = new Date();
    var currentDay = now.getDay() === 0 ? 6 : now.getDay() -1;
    console.log("days from Monday", currentDay);
    var mondayDate = moment().subtract(currentDay, 'days').format("YYYY-MM-DD");
    console.log("date on Monday this week", mondayDate);
    // need to check if this week exists
    var week = board.weeks.filter(week => week.week_start_date.startsWith(mondayDate));
    if(week.length === 0) {
      console.log("no current week found");
      dispatch(addWeek({
        family_id: selectedFam.id,
        board_id: board.id,
        week_start_date: mondayDate + "T00:00:00"
      }));
    } else {
      console.log("found the current week");
      dispatch(switchWeek(week[0]));
    }
  }

  const familyOptions = families.map(family => <option key={"family_" + family.id} value={family.id}>{family.family_name}</option>);
  const boardOptions = families.length > 0 && selectedFam.boards.map(board => <option key={"board_" + board.id} value={board.id}>{board.board_name}</option>);
  const currentWeek = Object.keys(selectedWeek).length !== 0 && <WeekSelector>
    <button onClick={gotoPrevWeek}>-</button>
    <p>Week {moment(selectedWeek.week_start_date).format("w YYYY")}</p>
    <button onClick={gotoNextWeek}>+</button>
  </WeekSelector>

  const switchFamily = (id) => {
    var family = families.filter(family => family.id === parseInt(id))[0];
    dispatch(clearBoard());
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
        <button>Add Board</button>
        <NavDivider/>
        {currentWeek}
        <NavDivider/>
        <button onClick={gotoThisWeek}>Go to Current Week</button>
      </NavContainer>
    </div>
  )
}