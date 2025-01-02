
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export let api=createAsyncThunk("fetchdata",async (user)=>{
    let data=await fetch(`http://localhost:3000/user/${user}`)
    let newData=await data.json()

    return newData
})



let init={
   data:[]
}

let apiData=createSlice({
    name:"Counter",
    initialState:init,
    reducers:{
        addData:(state,action)=>{
            // console.log(action);

            state.data=[...state.data,action.payload]
            
        }
    },
    extraReducers:(builder)=>{

        builder.addCase(api.fulfilled,(state,action)=>{
            // console.log(action);

            state.pro_arr=action.payload
            
        })
        
        builder.addCase(api.rejected,(state,action)=>{
            console.log(state);
            
        })

    }
})

export let {addData}=apiData.actions;

export default apiData.reducer;