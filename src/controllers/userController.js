

export const getUserById = async (req, res) => {
    try{
        const user = req.user;

        res.status(200).json({
            message: "User found",
            user: {
                id: user.user_id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                lastLogged : user.last_logged,
                lastPWDChange : user.last_pwd_change,
            },
        });
    } catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};