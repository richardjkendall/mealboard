import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

import { selectDays, selectMeals } from './boardSlice';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;

  width: 100vw;
`

const Cell = styled.div`
  flex-grow: 0;
  width: calc(100% / 8);
`

const WeekHeader = styled(Cell)`
  font-weight: bold;
  text-align: center;
  border-left: solid 1px black;
`

const MealRow = styled(Row)`
  height: 200px;
  border-top: solid 1px black;
`

const MealCell = styled(Cell)`
  height: 100%;
  
  &:first-child {
    margin-left: 1px;
  }

  &:not(:first-child) {
    border-left: solid 1px black;
  }
`

const MealHeaderCell = styled(MealCell)`
  p {
    padding-left: 10px;
  }
`

export default function Board(props) {
  const days = useSelector(selectDays);
  const meals = useSelector(selectMeals);

  const DayHeaders = days.map(day => <WeekHeader><p>{day}</p></WeekHeader>);
  const MealRows = meals.map(meal => {
    const mealDays = days.map(day => <MealCell></MealCell>);
    return (
      <MealRow>
        <MealHeaderCell><p>{meal}</p></MealHeaderCell>
        {mealDays}
      </MealRow>
    )
  });

  return (
    <div>
      <Row>
        <WeekHeader></WeekHeader>
        {DayHeaders}
      </Row>
      {MealRows}
    </div>
  )
}

