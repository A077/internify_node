// api/modules/skills/skill.handlers.js
// db.skills.createIndex({ name: "text" },{background:true})
import mongoose from 'mongoose';

const Skills = mongoose.model('skill');

export function handleGet(req,res) {    
    const params = req.params.search.replace(/[-\\^$*+?.()|[\]{}]/g, '').trim();
    const white = new RegExp("^\\w+$");
    if(!params || params == '' || !white.test(params)) res.end('[]');
    else {
        const pattern = new RegExp("^\\w*"+params+"\\w*$","gi");
        return Skills.find({"name":pattern})
               .exec(function(err,result){
                if(err) {
                    console.log(err);
                    res.status(500).json("something went wrong");
                } else res.json(result);
               });    
    }    
}
