var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var passport          =     require('passport')
var FacebookStrategy  =     require('passport-facebook').Strategy
var auth           =     require('../config/auth')
const { response } = require('express')
const { ObjectID } = require('mongodb')
var objectId=require('mongodb').ObjectID

module.exports={
  doSignup:(userData)=>{
    let regStatus=false
    let response={};
    return new Promise(async(resolve,reject)=>{
        userData.password=await bcrypt.hash(userData.password,10)
        let email=await db.get().collection(collection.USER_COLLECTION ).findOne({email:userData.email})
        if(email){
          response.error=true;
          resolve(response)
        } else{
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
        response.user=(data.ops[0])
        response.status=true;
        resolve(response);
        })}
    })


},
 // get doctor detailes to the home page //
getDoctorDetailes:(docID)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(docID)
    db.get().collection(collection.DOCTOR_COLLECTION).findOne({_id:objectId(docID)}).then((response)=>{
      resolve(response)
    })
  })
},

//adding appointment detailes to the database //
addAppointment:(appDetailes,User,docId)=>{
  return new Promise(async(resolve,reject)=>{
  
   let appointment={
    doctor:objectId(docId),
    user:objectId(User._id),
    docName:appDetailes.name,
     date:appDetailes.date,
    time:appDetailes.time,
    bookingFor:User.name,
    status:"Requested"
  }
  db.get().collection(collection.APPOINTMENT_COLLECTION).insertOne(appointment).then((data)=>{
    resolve(data.ops[0])
  })
 })
},

//get each user's appointments to their profile //
getAppointments:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(userId)
    let appointment=[]
   appointment.requested=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
    {
      $match:{
        $and:[{user:objectId(userId)},{status:"Requested"}]
        }
    },
    {
      $lookup:{
        from:collection.DOCTOR_COLLECTION,
        localField:"doctor",
        foreignField:"_id",
        as:"doctorDetailes"
        
      }
    },
      {
        $unwind:"$doctorDetailes"
      },
    
    
    
  ])
    .toArray();

    appointment.confirmed=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
      {
        $match:{
          $and:[{user:objectId(userId)},{status:"confirmed"}]
          }
      },
      {
        $lookup:{
          from:collection.DOCTOR_COLLECTION,
          localField:"doctor",
          foreignField:"_id",
          as:"doctorDetailes"
          
        }
      },
        {
          $unwind:"$doctorDetailes"
        },
      
      
      
    ])
      .toArray();
      appointment.cancelled=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
        {
          $match:{
            $and:[{user:objectId(userId)},{status:"cancelled"}]
            }
        },
        {
          $lookup:{
            from:collection.DOCTOR_COLLECTION,
            localField:"doctor",
            foreignField:"_id",
            as:"doctorDetailes"
            
          }
        },
          {
            $unwind:"$doctorDetailes"
          },
        
        
        
      ])
        .toArray();
        appointment.consulted=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
          {
            $match:{
              $and:[{user:objectId(userId)},{status:"consulted"}]
              }
          },
          {
            $lookup:{
              from:collection.DOCTOR_COLLECTION,
              localField:"doctor",
              foreignField:"_id",
              as:"doctorDetailes"
              
            }
          },
            {
              $unwind:"$doctorDetailes"
            },
          
          
          
        ])
          .toArray();
    resolve(appointment)

      
    })
  
},
//get user detailes from database //
getUserDetailes:(userId)=>{
  return new Promise((resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
          resolve(user)
      })
  })
},
updateUser:(userId,userDetails)=>{
    
  return new Promise(async(resolve,reject)=>{
    if(userDetails.password)
    {
      userDetails.password=await bcrypt.hash(userDetails.password,10)
    }else{
      let user=db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
      userDetails.password=user.password
    }
      db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
          $set:{
              name:userDetails.name,
                  email :userDetails.email,
                  password:userDetails.password,
              mobile:userDetails.phone,
              place:userDetails.place,
              dob:userDetails.dob

              

          }
      }).then((response)=>{
          resolve()
      })

  })
},
//to cancel a user appointment //
cancelAppointment:(appId)=>{
  return new Promise((resolve,reject)=>{
      
  console.log(appId);
  
  db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({_id:objectId(appId)},{
      $set:{
          
          status:"cancelled"

      }
  }).then((response)=>{
      resolve()
  })

}) 
},


//To show only the available date and timeslot for appointment//
checkDate:(detailes)=>{
  reqdate=detailes.date
  console.log(reqdate)
let bookingSlot=['9.00-9.30 AM','9.30-10.00 AM','10.00-10.30 AM','10.30-11.00AM','11.00-11.30 AM','11.30-12.00 PM',
'4.00-4.30 PM','4.30:5.00 PM','5.00-5.30 PM','5.30-6.00 PM']
  return new Promise(async(resolve,reject)=>{
   let timeslot= await db.get().collection(collection.APPOINTMENT_COLLECTION).distinct("time",{$and:[{doctor:objectId(detailes.doctor)},{date:reqdate},{status:"confirmed"}]})
   console.log(timeslot);
   var difference = bookingSlot.filter(function(val) {
    return timeslot.indexOf(val) == -1;
  });
console.log(difference);
  resolve(difference)


  })

},

getPrescriptionDetails:(appId)=>{
  return new Promise(async(resolve,reject)=>{
    let presc=db.get().collection(collection.PRESCRIPTION_COLLECTION).find({Appointment:objectId(appId)}) .toArray()
    resolve(presc)
  })
}

}


  
