/*
    形相關物件
*/

/*形物件*/

function shape(name, symbol, url, type) {

    this.name = name;
    this.symbol = symbol;
    this.url = url;
    this.type = type;
    this.start = {};
    this.next = [];
}

shape.prototype.add_start = function (x, y, z) {

    this.start.x = x;
    this.start.y = y;
    this.start.z = z;
}


shape.prototype.add_next = function (x,y,z) {

    this.next.push( {x:x, y:y, z:z} );
}

/*形管理物件*/

function shapeManager() {

    this.shapes = {};
}

shapeManager.prototype.add = function (name, symbol, url, type) {

    var obj = new shape(name, symbol, url, type);

    this.shapes[symbol] = obj;

    return obj;
}

shapeManager.prototype.find_by_symbol = function (symbol) {

    if (this.shapes[symbol] == undefined || this.shapes[symbol] == null) {

        console.error("未找到符號形為" + symbol + "的形");
        return null;
    }

    return this.shapes[symbol];

}

shapeManager.prototype.find_first_shape = function (str) {

    var ans = null;

    for (var i in this.shapes) {
        if (str.indexOf(this.shapes[i].symbol) != -1) {
            if (ans == null) {

                ans = this.shapes[i];
            }
            else if (this.shapes[i].symbol.length > ans.symbol.length) {

                ans = this.shapes[i];
            }
        }
    }

    return ans;
}

shapeManager.prototype.clear = function () {

    for (var i in this.shapes)
        delete this.shapes[i];
}

shapeManager.prototype.dir = function () {

    console.log("形狀列表");
    console.dir(this.shapes);
}