var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
//var router = express.Router();
var objectId=require('mongodb').ObjectID

module.exports={
    doLogin:(userData)=>{
        

        return new Promise(async(resolve,reject)=>{
          let loginStatus=false
          let response={}
  let doctor=await db.get().collection(collection.DOCTOR_COLLECTION).findOne({username:userData.username})
  if (doctor){
      bcrypt.compare(userData.password,doctor.password).then((status)=>{
  if(status){
      console.log('login success');
      response.doctor=doctor
      response.status=true
      resolve(response)
  }else{
      console.log("login failed");
      resolve({status:false})
  }
      })
  }else{
      console.log("cant find email");
      resolve({status:false})
  }
      })
  },
  getAppointments:(docId)=>{
    return new Promise(async(resolve,reject)=>{
      console.log(docId)
      let appointment=[]
     appointment.requested=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
      {
        $match:{
          $and:[{doctor:objectId(docId)},{status:"Requested"}]
          }
      },
      {
        $lookup:{
          from:collection.USER_COLLECTION,
          localField:"user",
          foreignField:"_id",
          as:"userDetailes"
          
        }
      },
        {
          $unwind:"$userDetailes"
        },
      
      
      
    ])
      .toArray();
      
     resolve(appointment)
  
        
      })
    
  },
  acceptAppointment:(appId)=>{
    return new Promise((resolve,reject)=>{
        
    console.log(appId);
    
    db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({_id:objectId(appId)},{
        $set:{
            
            status:"confirmed"

        }
    }).then((response)=>{
        resolve()
    })

}) 
  },
  viewAppointment:(docId,today)=>{
    return new Promise(async(resolve,reject)=>{
      
      let appointment=[]
     appointment.today=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
      {
        $match:{
          $and:[{doctor:objectId(docId)},{date:today},{status:"confirmed"}]
          }
      },
      {
        $lookup:{
          from:collection.USER_COLLECTION,
          localField:"user",
          foreignField:"_id",
          as:"userDetailes"
          
        }
      },
        {
          $unwind:"$userDetailes"
        },
      
      
      
    ])
      .toArray();
      appointment.upcoming=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
        {
          $match:{
            $and:[{doctor:objectId(docId)},{date:{$gt:today}},{status:"confirmed"}]
            }
        },
        {
          $lookup:{
            from:collection.USER_COLLECTION,
            localField:"user",
            foreignField:"_id",
            as:"userDetailes"
            
          }
        },
          {
            $unwind:"$userDetailes"
          },
        
        
        
      ])
        .toArray();
        appointment.consulted=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
          {
            $match:{
              $and:[{doctor:objectId(docId)},{status:"consulted"}]
              }
          },
          {
            $lookup:{
              from:collection.USER_COLLECTION,
              localField:"user",
              foreignField:"_id",
              as:"userDetailes"
              
            }
          },
            {
              $unwind:"$userDetailes"
            },
          
          
          
        ])
          .toArray();
          appointment.expired=await  db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
            {
              $match:{
                $and:[{doctor:objectId(docId)},{date:{$lt:today}},{status:"confirmed"}]
                }
            },
            {
              $lookup:{
                from:collection.USER_COLLECTION,
                localField:"user",
                foreignField:"_id",
                as:"userDetailes"
                
              }
            },
              {
                $unwind:"$userDetailes"
              },
            
            
            
          ])
            .toArray();
        
      
     resolve(appointment)
  
        
      })
    
  },
  getConsultingAppointment:(appId)=>{
    return new Promise((resolve,reject)=>{
        
    console.log(appId);
    
    db.get().collection(collection.APPOINTMENT_COLLECTION).findOne({_id:objectId(appId)})
       
  .then((response)=>{
        resolve(response)
    })

}) 
  },
  consult:(appId,prescriptionDetailes,docId,userId)=>{
    return new Promise(async(resolve,reject)=>{
      let prescription={
        Appointment:objectId(appId),
        userID:objectId(userId),
        docID:objectId(docId),
        name:prescriptionDetailes.name,
        date:prescriptionDetailes.date,
        doctor:prescriptionDetailes.doctor,
        prescription:prescriptionDetailes.prescription
      }
      await db.get().collection(collection.PRESCRIPTION_COLLECTION).insertOne(prescription).then((response)=>{
        db.get().collection(collection.APPOINTMENT_COLLECTION).updateOne({_id:objectId(appId)},{
          $set:{
            status:"consulted"
          }
        })
        resolve()
      })
    })

  },
  getAllPatients:(docId)=>{
    return new Promise(async(resolve,reject)=>{
    let mypatients=await db.get().collection(collection.APPOINTMENT_COLLECTION).aggregate([
      {
        $match:{doctor:objectId(docId)}
      },
      {
        $group:
        {
            _id: "$user"

        }
    },
      {
      $lookup:{
        from:collection.USER_COLLECTION,
              localField:"_id",
              foreignField:"_id",
              as:"patients"

      }
    },
    {
      $unwind:"$patients"
    }
    ]).toArray()
    resolve(mypatients)  

    })
  },

getAllResults:(docId)=>{
  return new Promise((resolve,reject)=>{
         db.get().collection(collection.PRESCRIPTION_COLLECTION).find({docID:objectId(docId)}).toArray().then((prescription)=>{
       resolve(prescription)
  })
    
  })
},
}