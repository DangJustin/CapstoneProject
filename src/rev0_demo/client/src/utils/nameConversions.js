import axios from 'axios';
async function getGroupName(groupID){
    // console.log(groupID);
    if(!groupID){
        return null;
    }
    try {
        const groupResponse = await axios.get("http://localhost:5000/api/account/groups/group/"+String(groupID));
        const name = groupResponse.data.groupName;
        return name;
    } catch (error){
        console.error('Error getting group name:', error);
    }
}

async function getUserName(userID){
    console.log(userID);
    if(!userID){
        return null;
    }
    try {
        const userResponse = await axios.get("http://localhost:5000/api/account/users/id/"+String(userID));
        const name = userResponse.data.username;
        return name;
    } catch (error){
        console.error('Error getting group name:', error);
    }
}

async function getUserNames(users){
    console.log(users);
    if(!users){
        return null;
    }
    try {
        const modifiedUsers = [...users];
        for (let i = 0; i < modifiedUsers.length; i++){
            console.log(await getUserName(users[i]));
            modifiedUsers[i] = await getUserName(users[i]);
          }
        return modifiedUsers;
    } catch (error){
        console.error('Error getting group name:', error);
    }
}


export {getGroupName, getUserName, getUserNames}