/*
    規則相關物件
*/

/*規則物件*/

function rule(from, to, description) {

    this.from = from;
    this.to = to;
    this.description = description;
}

/*規則管理物件*/

function ruleManager() {

    this.rules = [];
}

ruleManager.prototype.add = function (from, to, description) {

    this.rules.push(new rule(from, to, description));
}

ruleManager.prototype.clear = function () {

    while (this.rules.length > 0) {
        this.rules.pop();
    }
}

ruleManager.prototype.dir = function () {

    console.log("規則列表");
    console.dir(this.rules);
}