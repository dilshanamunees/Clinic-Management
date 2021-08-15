const passport = require("passport");
const { check, validationResult } = require('express-validator');
var express = require("express");
var router = express.Router();
const { response } = require("express");
const adminHelpers = require("../helpers/admin-helpers");
require("../helpers/passport-auth");
var userHelpers = require("../helpers/user-helpers");
var flash = require("connect-flash");
const fs = require("fs");
const ExcelJS = require("exceljs");
const tempfile=require("tempfile")

var router = express.Router();
const verifylogin = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", (req, res, next) => {
  let user = req.user;
  console.log(user);
  adminHelpers.getAllDoctors().then((doctors) => {
    res.render("user/view-doctor", { doctors, user });
  });
});

router.get("/login", (req, res) => {
  if (req.query.err) {
    console.log(req.query.err);
    (messages = req.flash()), res.render("user/login", { messages });
  } else {
    //console.log(req.flash('error'))
    messages = req.flash();
    console.log(messages);
    res.render("user/login", { messages });
  }
});
router.post(
  "/login",
  passport.authenticate("local", {
    //successRedirect: '/',
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    console.log("user", req.user);
    res.redirect("/");
  }
);

router.get("/register", (req, res) => {
  res.render("user/register");
});

router.post("/register",[
  check('password', 'Password length should be 8 to 10 characters')
                  .isLength({ min: 6, max: 10 }),
       check('email', 'Email is not valid')
                  .isEmail()
                  .normalizeEmail(),
      check('name', 'This username must me 3+ characters long')
                  .exists()
                  .isLength({ min: 3 }),
],  (req, res) => {
  const errors = validationResult(req);
 
  // If some error occurs, then this
  // block of code will run
  if (!errors.isEmpty()) {
    
    const alert = errors.array()
    console.log(alert)
      res.render("user/register",{alert})
  }else{
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.error) {
      var error = response.error;
      req.flash("error", "Your account is exists. Please log in.");
      error = "Your account is exists. Please log in.";
      res.redirect("login?err=" + encodeURIComponent(error));
    } else {
     
      req.user = response.user;
      console.log(req.user);
      res.redirect("/");
     
    }
  
  });
}
});

router.get("/failed", (req, res) => res.send("You Failed to log in!"));
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email,user_photos" })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.get("/logout", function (req, res) {
  req.user = null;
  req.logout();
  res.redirect("/");
});
router.get("/booking/:id", verifylogin, async (req, res) => {
  console.log(req.user);
  let doctor = await userHelpers.getDoctorDetailes(req.params.id);
  console.log(doctor);
  res.render("user/booking", { doctor, user: req.user });
});
router.post("/booking/:id", verifylogin, async (req, res) => {
  //console.log(req.params.id)

  console.log(req.body);
  userHelpers
    .addAppointment(req.body, req.user, req.params.id)
    .then((response) => {
      let appointment = {
        doctor: response.docName,
        Date: response.date,
        Time: response.time,
        BookingFor: response.bookingFor,
      };

      res.render("user/bookingConfirmed", { appointment });
    });
});

router.get("/appointment", verifylogin, async (req, res) => {
  console.log(req.session);

  userHelpers.getAppointments(req.user._id).then((appointment) => {
    console.log(appointment.consulted)
    res.render("user/appointment", { user: req.user, appointment });
  });
});

router.get("/edit-profile/:id", async (req, res) => {
  let user = await userHelpers.getUserDetailes(req.params.id);
  console.log(user);
  res.render("user/editprofile", { user });
});
router.post("/edit-profile/:id", (req, res) => {
  console.log(req.params.id);
  let id = req.params.id;
  userHelpers.updateUser(req.params.id, req.body).then(() => {
    // res.redirect('/appointment')
    if (req.body.image) {
      const path = "./public/images/" + id + ".jpg";
      const imgdata = req.body.image;
      console.log(imgdata);
      const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "");
      fs.writeFileSync(path, base64Data, { encoding: "base64" });
    }
    res.redirect("/appointment");
  });
});
router.get("/cancel/:id", (req, res) => {
  let appId = req.params.id;
  //console.log((proId))
  userHelpers.cancelAppointment(appId).then((response) => {
    res.redirect("/appointment");
  });
});

router.post("/checkdate", (req, res, next) => {
  userHelpers.checkDate(req.body).then((response) => {
    console.log(response);
    res.json(response);
  });
});

router.get('/prescription/:id', verifylogin, async (req, res) => {
  console.log(req.params.id)
  let presc = await userHelpers.getPrescriptionDetails(req.params.id)
  console.log(presc)
  presc[0].prescription = presc[0].prescription.toString()
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Prescription');
  worksheet.columns = [
    { header: 'Patient Name', key: 'name', width: 25 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Age', key: 'age', width: 8 },
    { header: 'Doctor Name', key: 'docName', width: 25 },
    { header: 'Speciality', key: 'speciality', width: 20 },
    { header: 'Prescription', key: 'prescription', width: 50 },
  ];
  worksheet.addRow(presc[0]);

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  var tempFilePath = tempfile('.xlsx');
  workbook.xlsx.writeFile(tempFilePath).then(function () {
    console.log('file is written');
    res.sendFile(tempFilePath, function (err) {
      console.log('error downloading file: ' + err);
    });
  });
})

/* GET home page. */

module.exports = router;
