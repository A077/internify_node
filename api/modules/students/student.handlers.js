// api/modules/students/student.handlers.js
import mongoose from 'mongoose';

const Student = mongoose.model('student');

export function search(req, res, next) {

    if (!req.query) 
        return res.status(400)
                  .json({param: "all", msg: "Please fill in at least one field."});
    

    const keys = Object.keys(req.query),
          query = {};

    keys.forEach((key) => {
        let param;
        try { param = JSON.parse(req.query[key]) } 
        catch(err){ param = req.query[key] }
        if(param) {
            if(key=='languages') {
                let check = false;
                param.forEach((i)=>{
                    if(i==1) check=true;
                });
                if(!check) return 0;
            }
            else if(key=='skills') {
                if(param.length==0) return 0;
                let skillfx = param.map((item)=>{
                    return {
                        name: item.name,
                        _id: item._id
                    }
                });
                query[key] = {$in: skillfx};
                return 0;
            }
            query[key] = param;
        }
    });
    query.signed = true;


    Student.count(query, function (err, number) {
        if (err) {
            console.log(err);
            return res.status(500).json({param: "student", msg: "Something went wrong when searching."});
        }
        res.json({param: "student", msg: number});
    });
}
