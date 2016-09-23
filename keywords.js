// This regex matches the exact word
function matchExact(words){
    var regStr = "\\b(";
    for (var i=0; i < words.length; i++) {
        //first word in array
        if (i === 0){
            regStr += words[i];
        } else {
            regStr += "|"+words[i];
        }
    }
    regStr += ")\\b";
    var regExp = new RegExp(regStr, "i");
    console.log(regExp);
    return regExp;
}

// This regex checks that the word is a substring of what the user said
function matchWithin(words){
    var regStr = "\\W*(";
    for (var i=0; i < words.length; i++) {
        //first word in array
        if (i === 0){
            regStr += words[i];
        } else {
            regStr += "|"+words[i];
        }
    }
    regStr += ")\\W*";
    var regExp = new RegExp(regStr, "i");
    console.log(regExp);
    return regExp;
}

module.exports = {
    hi: matchExact(["hi", "hey", "hello", "yo", "what's up"]),
    searchnews: matchWithin(["find", "search", "keyword"]),
    help: matchWithin(["help"]),
    menu: matchExact(["menu"]),
    trending: matchWithin(["trend"]),
    topnews: matchExact(["top","category","categories"]),
    start: matchExact(["start", "get started"])
}