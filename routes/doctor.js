const { response}=require('express');
const {render}=require('../app');
var express = require('express');
var doctorHelpers=require('../helpers/doctor-helpers')
var router = express.Router();
const verifyDoctor=(req,res,next)=>{
    if(req.session.DoctorLoggedIn)
    {
      next()
    }else{
      res.redirect('/doctor/doctor-login')
    }
  }

  router.get('/',verifyDoctor,(req, res, next)=> {
    
      res.redirect('doctor/view-appointments')
    })
   
   
   router.get('/doctor-login',(req,res)=>{
    
      let doctor=req.session.doctor
      
    if(req.session.doctor){
      res.redirect('/doctor')
    }else{
    
    
      res.render('doctor/doctor-login',{doctor,"loginErr":req.session.adminLoginErr})
      req.session.adminLoginErr=false
    }
    })

    router.post('/doctor-login',(req,res)=>{
  
        doctorHelpers.doLogin(req.body).then((response)=>{
          
          if(response.status){
            req.session.doctor=response.doctor
            req.session.DoctorLoggedIn=true
        
            res.redirect('/doctor')
          }else{
            req.session.doctorLoginErr="invalid username or password" 
            res.redirect('/doctor/doctor-login')
          }
        })
      })

      router.get('/accept/:id',(req,res)=>{
        let appId=req.params.id
        //console.log((proId))
        doctorHelpers.acceptAppointment(appId).then((response)=>{
          res.redirect('/doctor/bookings')
        })
      })
      router.get('/view-appointments',verifyDoctor,(req,res)=>{
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today = mm + '/' + dd + '/' + yyyy

console.log(today);
let doctor=req.session.doctor
doctorHelpers.viewAppointment(req.session.doctor._id,today).then((appointment)=>{  
  console.log(appointment.upcoming); 
        res.render('doctor/appointments',{doctor,appointment})
})
      })

      router.get('/consult/:id',verifyDoctor,async(req,res)=>{
        let appId=req.params.id
        //console.log((proId))
       // doctorHelpers.consultAppointment(appId).then((response)=>{
         // res.redirect('/doctor/view-appointments')
       // })
       let appointment=await doctorHelpers.getConsultingAppointment(req.params.id)
       console.log(appointment);
       res.render('doctor/consult-form',{appointment})
      })
      router.post('/consult/:id/:user',verifyDoctor,(req,res)=>{
console.log(req.params.id,req.body);
let docId=req.session.doctor._id
doctorHelpers.consult(req.params.id,req.body,docId,req.params.user).then((response)=>{
res.redirect('/doctor/view-appointments')
})
      })

      router.get('/bookings',verifyDoctor,(req,res)=>{
        let doctor=req.session.doctor
        doctorHelpers.getAppointments(req.session.doctor._id).then((appointment)=>{
        res.render('doctor/doctor-page',{doctor,appointment})
        })

      })
      router.get('/mypatients',verifyDoctor,(req,res)=>{
        let doctor=req.session.doctor
        doctorHelpers.getAllPatients(req.session.doctor._id).then((mypatients)=>{
          console.log(doctor,mypatients);
          res.render('doctor/mypatients',{doctor,mypatients})
        })
      })
      router.get('/results',verifyDoctor,async(req,res)=>{
        let doctor=req.session.doctor
       let prescription=await  doctorHelpers.getAllResults(req.session.doctor._id)
          console.log(prescription);
          res.render('doctor/results',{doctor,prescription})
        })
        router.get('/logout',verifyDoctor,(req,res)=>{
          req.session.doctor=null
          req.session.doctorLoggedIn=null
          res.redirect('/doctor/doctor-login')
        })
      
    
      

   



    module.exports = router;
