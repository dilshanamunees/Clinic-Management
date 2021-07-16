var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
//var router = express.Router();
var objectId = require('mongodb').ObjectID

module.exports = {
    doRegister: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.password = await bcrypt.hash(adminData.password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data.ops[0])
            })
        })


    },
    doLogin: (userData) => {


        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: userData.Email })
            if (admin) {
                bcrypt.compare(userData.password, admin.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("cant find email");
                resolve({ status: false })
            }
        })
    },
    addDoctor: (doctor, callback) => {

        return new Promise(async (resolve, reject) => {
            doctor.password = await bcrypt.hash(doctor.password, 10)
            db.get().collection('doctor').insertOne(doctor).then((data) => {

                console.log(data)
                callback(data.ops[0]._id)

            })
        })
    },

    getAllDoctors: () => {
        return new Promise(async (resolve, reject) => {
            let doctors = await db.get().collection(collection.DOCTOR_COLLECTION).find({ Status: "active" }).toArray()
            resolve(doctors)
        })

    },

    getDoctorDetailes: (docId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DOCTOR_COLLECTION).findOne({ _id: objectId(docId) }).then((doctor) => {
                resolve(doctor)
            })
        })
    },
    updateDoctor: (docId, docDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.DOCTOR_COLLECTION).updateOne({ _id: objectId(docId) }, {
                $set: {
                    name: docDetails.name,
                    Specialised: docDetails.Specialised,
                    Field: docDetails.Field


                }
            }).then((response) => {
                resolve()
            })

        })
    },
    deleteDoctor: (docId) => {
        return new Promise((resolve, reject) => {

            console.log(docId);
            console.log(objectId(docId));
            db.get().collection(collection.DOCTOR_COLLECTION).updateOne({ _id: objectId(docId) }, {
                $set: {

                    Status: "deleted"

                }
            }).then((response) => {
                resolve()
            })

        })

    }, getAllPatients: () => {
        return new Promise(async (resolve, reject) => {
            let patients = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(patients)
        })

    },
    addPatient: (patient, callback) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).insertOne(patient).then((data) => {

                console.log(data)
                callback(data.ops[0]._id)

            })
        })
    },
    getPatientDetailes: (PId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(PId) }).then((patient) => {
                resolve(patient)
            })
        })
    },
    updatePatient: (PId, PDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(PId) }, {
                $set: {
                    name: PDetails.name,
                    age: PDetails.age,
                    mobile: PDetails.mobile


                }
            }).then((response) => {
                resolve()
            })

        })
    },
    deletePatient: (PId) => {
        return new Promise((resolve, reject) => {

            console.log(PId);
            console.log(objectId(PId));
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(PId) }, {
                $set: {

                    Status: "deleted"

                }
            }).then((response) => {
                resolve()
            })

        })

    },
    countDetailes: () => {
        return new Promise(async (resolve, reject) => {
            let count = []
            count.Doctor = await db.get().collection(collection.DOCTOR_COLLECTION).countDocuments({ Status: "active" })
            count.Patient = await db.get().collection(collection.USER_COLLECTION).countDocuments()
            count.Appointment = await db.get().collection(collection.APPOINTMENT_COLLECTION).countDocuments({ status: "consulted" })

            resolve(count)
        })
    }
}





