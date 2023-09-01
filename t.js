
var commonChars = function(words) {
    let hmap = new Map();
    for( let i = 0; i < words.length; i++){
        for(let j = 0; j < words[i].length; j++){
            if(hmap.has(words[i][j])){
                hmap.set(words[i][j], hmap.get(words[i][j]) + 1);
            } else {
                hmap.set(words[i][j], 1);
            }
        }
    }
    console.log(hmap);
    let keys = hmap.keys(), out = [];
    for (let key of keys) {
        if(hmap.get(key) % words.length === 0 ){
            out.push(key);
        } else{
            console.log("1");
        }
    }
    console.log(keys);
    return out;
};

const words = ["cool","lock","cook"];
console.log(commonChars(words));