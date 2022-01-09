import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import {
  selectedFamily
} from '../family/familySlice';

import { 
  selectDays, 
  selectMeals 
} from './boardSlice';

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

const MealsTray = styled.div`
  width: 100vw;
`

const MealsTrayHeader = styled.div`
  width: 100%;
  background-color: #efefef;
  border-radius: 10px;
  height: 40px;
  
  p:first-child {
    float: left;
    display: inline;
  }

  /*div:last-child {
    float: right;
    display: inline;
  }*/
`

export default function Board(props) {
  const days = useSelector(selectDays);
  const meals = useSelector(selectMeals);

  const DayHeaders = days.map(day => <WeekHeader key={"week_" + day}><p>{day}</p></WeekHeader>);
  const MealRows = meals.map(meal => {
    const mealDays = days.map(day => <MealCell key={"mealday_" + meal + "_" + day}></MealCell>);
    return (
      <MealRow key={"meal_" + meal}>
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
      <MealsTray>
        <MealsTrayHeader>
          <p>Meals</p>
          <div>
            <p>Search</p>
          </div>
        </MealsTrayHeader>

      </MealsTray>
    </div>
  )
}

