export const getRegisterPage = async (req, res) => {
  res.render("auth/register");
};

export const postRegister = async (req, res) => {
    let {name, email, password} = req.body
    console.log(name, email, password);
    res.redirect("/")
    
}