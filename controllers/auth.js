const mariadb = require("mariadb");

const pool = mariadb.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
});

exports.register = (req, res) => {
	console.log(req.body);
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password; 
	const passwordconfirm = req.body.passwordconfirm;

	pool.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
		if(error){
			console.log(error);
		}
		if(results.length>0){
			return res.render('register', {
				message: "Email is in use"
			})
		} else if(password!=passwordconfirm){
			return res.render('register', {
				message: "Passwords don't match"
			})
		}

	})

	res.send("Form submitted");
}
