
import { configureStore } from "@reduxjs/toolkit";
import apiData from "./redux"

export let store=configureStore({
    reducer:apiData
})

