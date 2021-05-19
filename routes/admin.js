const { response}=require('express');
const {render}=require('../app');
var express = require('express');
var adminHelpers=require('../helpers/admin-helpers')
var router = express.Router();

const verifyAdmin=(req,res,next)=>{
  if(req.session.adminLoggedIn)
  {
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}


//let adminData={}
//adminData.email="admin"
//adminData.password="admin"
router.get('/',verifyAdmin,async(req, res, next)=> {
 console.log(req.body)
 let admin=req.session.admin
 
  let count=await adminHelpers.countDetailes()
  
  console.log(count)
res.render('admin/admin-page',{admin,count})
})
  

router.get('/admin-login',(req,res)=>{
//adminHelpers.doRegister(adminData).then((response)=>{
  let admin=req.session.admin
  
if(req.session.admin){
  res.redirect('/admin')
}else{


  res.render('admin/admin-login',{admin,"loginErr":req.session.adminLoginErr})
  req.session.adminLoginErr=false
}
})
//});
router.post('/admin-login',(req,res)=>{
  
  adminHelpers.doLogin(req.body).then((response)=>{
    
    if(response.status){
      req.session.admin=response.admin
      req.session.adminLoggedIn=true
  
      res.redirect('/admin')
    }else{
      req.session.adminLoginErr="invalid username or password" 
      res.redirect('/admin/admin-login')
    }
  })
})
router.get('/logout',verifyAdmin,(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=null
  res.redirect('/admin/admin-login')
})

router.get('/view-admin',(req,res)=>{
  adminHelpers.getAllDoctors().then((doctors)=>{
    console.log(doctors)
    adminHelpers.getAllPatients().then((patients)=>{
      console.log(patients)

res.render('admin/view-admin',{admin:true,doctors,patients})
    })
  })
})
router.get('/admin-page',(req,res)=>{
  res.render('admin/admin-page',{admin:true})
})
router.get('/add-doctor',(req,res)=>{
  res.render('admin/add-doctor',{admin:true})
})

router.post('/add-doctor',(req,res)=>{
 
  adminHelpers.addDoctor(req.body,(id)=>{
    
    let image=req.files.image
  //console.log(id);
  image.mv ('./public/doctor-images/'+id+'.jpg',(err,done)=>{
    if(!err){
     
      res.render('admin/add-doctor',{admin:true})
    }else{
      console.log(err);
    }
  })
})

  
})

router.get('/edit-doctor/:id',async (req,res)=>{
  let doctor=await adminHelpers.getDoctorDetailes(req.params.id)
  console.log(doctor);
  res.render('admin/edit-doctor',{doctor})
})
 
router.post('/edit-doctor/:id',(req,res)=>{
  console.log(req.params.id);
  let id=req.params.id
  adminHelpers.updateDoctor(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      image.mv ('./public/doctor-images/'+id+'.jpg')

    }
  })
})

router.get('/delete-doctor/:id',(req,res)=>{
  let docId=req.params.id
  //console.log((proId))
  adminHelpers.deleteDoctor(docId).then((response)=>{
    res.redirect('/admin/view-admin')
  })
})

  


  

router.get('/list-patients',(req,res)=>{
 
res.render('admin/list-patients',{admin:true})
})


router.get('/add-patient',(req,res)=>{
  res.render('admin/add-patient',{admin:true})
})
router.post('/add-patient',(req,res)=>{
  adminHelpers.addPatient(req.body,(id)=>{
    
    let image=req.files.image
  //console.log(id);
  image.mv ('./public/patient-images/'+id+'.jpg',(err,done)=>{
    if(!err){
     
      res.render('admin/add-patient',{admin:true})
    }else{
      console.log(err);
    }
  })
})
})

router.get('/edit-patient/:id',async (req,res)=>{
  let patient=await adminHelpers.getPatientDetailes(req.params.id)
  console.log(patient);
  res.render('admin/edit-patient',{patient})
})

router.post('/edit-patient/:id',(req,res)=>{
  console.log(req.params.id);
  let id=req.params.id
  adminHelpers.updatePatient(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      image.mv ('./public/patient-images/'+id+'.jpg')

    }
  })
})
router.get('/delete-patient/:id',(req,res)=>{
  let PId=req.params.id
  //console.log((proId))
  adminHelpers.deletePatient(PId).then((response)=>{
    res.redirect('/admin/view-admin')
  })
})



router.get('/list-appointments',(req,res)=>{
  res.render('admin/list-appointments')
})
router.get('/view-admin',(req,res)=>{
  res.render('admin/view-admin')
})
router.post('/list-patients',(req,res)=>{
  console.log(req.body);
  //var base64Data=req.rawBody.replace(/^data:image\/png;base64,/,"");
 // console.log(base64Data);
  //console.log(id);
  let image=req.files.image
  image.mv ('./public/patient-images/jj.png',(err,done)=>{
    if(!err){
     
      console.log('success');
    }else{
      console.log(err);}
  res.redirect('admin/list-patients')
    
  })
})



module.exports = router;

