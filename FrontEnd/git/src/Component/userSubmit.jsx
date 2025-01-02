// import { useEffect } from "react"
// import { useState } from "react"


// function UserSubmit(){
//     let [data,setData]=useState([])
//     let [userName,setUserName]=useState("")
//     let [user,setUser]=useState("")

//     useEffect(()=>{
//         fetch(`https://api.github.com/users/${user}`).then(res=>{return res.json()}).then(res=>{setData(res)})
//     },[user])

//     let chn=(e)=>{
//         setUserName(e.target.value)
//     }

//     let sub=(e)=>{
//         e.preventDefault()
//         setUser(e.target[0].value)
//         // setData([...data,e.target[0]])
//     }

//     let userData=data.map((val,ind)=>{
//         return(
//             <div key={ind}>
//                 <h1>{userName} Details</h1>
//                 <img src={val.avatar_url} alt="" width={200}/>
//                 <ul>
//                     <li>{val.login}</li>
//                 </ul>
//             </div>
//         )
//     })

//     return (
//         <>
        
//         <form action="" onSubmit={sub}>
//         <input type="text" name="username" onChange={chn} value={userName}/>
//         <input type="submit" value="Search" />
//         </form>
//         {userData}
//         {/* {userData.length>0?userData: ""} */}

//         </>
//     )

// }

// export default UserSubmit

import { useEffect, useState } from "react";

function UserSubmit() {
  const [data, setData] = useState(null); // Initialize as null
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    if (user) {
      fetch(`https://api.github.com/users/${user}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("User not found");
          }
          return res.json();
        })
        .then((res) => setData(res))
        .catch((err) => {
          console.error(err);
          setData(null); // Clear data on error
        });
    }
  }, [user]);

  const handleChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserName("")
    setUser(userName); // Trigger useEffect
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          onChange={handleChange}
          value={userName}
        />
        <input type="submit" value="Search" />
      </form>

      {data ? (
        <div>
          <h1>{data.name || data.login} Details</h1>
          <img src={data.avatar_url} alt={`${data.login} avatar`} width={200} />
          <ul>
            <li>Username: {data.login}</li>
            <li>Public Repos: {data.public_repos}</li>
            <li>Followers: {data.followers}</li>
            <li>Following: {data.following}</li>
          </ul>
        </div>
      ) : (
        user && <p>User not found. Please try again.</p>
      )}
    </>
  );
}

export default UserSubmit;
