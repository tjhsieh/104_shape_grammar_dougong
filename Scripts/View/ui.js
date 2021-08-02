/*
    html互動相關物件
*/

function uiManager() {

    /*初始化*/

    var sketchpad_list = [];
    init();

    /*function*/

    /*介面的設定與初始化*/

    function init() {

        console.log("初始化ui介面");

        $(":file").filestyle({ iconName: "glyphicon-inbox" });
    }

    /*grammar tool*/

    this.grammar_pane_add = function (i, description, from, to, next_id) {

        var pane = "<br><div class='item-pane' onclick='shape_grammar_controller.choose_next("
        pane += next_id;
        pane += ")'><div class='information-pane'><h3>RULE - ";
        pane += i;
        pane += "</h3><table class='table table-bordered'><caption>";
        pane += description;
        pane += "</caption><tbody><tr class='success'><td>From</td><td>";
        pane += from;
        pane += "</td></tr><tr class='success'><td>To</td><td>";
        pane += to;
        pane += "</td></tr></tbody></table></div></div>";

        $("#grammar_chooser").append(pane);

    }

    this.grammar_pane_clear = function () {

        $("#grammar_chooser").empty();
    }

    this.update_grammar_string = function (str) {

        $("#grammar_string").val(str);
    }

    /*product list*/

    this.product_pane_add = function (name, symbol, grammar, id) {

        var pane = "<br><div class='item-pane'><div class='information-pane'><h3>";
        pane += name;
        pane += "</h3><p>";
        pane += symbol;
        pane += "</p><table class='table table-bordered'><tbody><tr class='success'><td>";
        pane += grammar;
        pane += "</td></tr></tbody></table><div class='shape-viewer' id='";
        pane += id;
        pane += "'></div></div></div>";

        $("#tab_productList").append(pane);
    }

    this.product_pane_clear = function () {

        $("#tab_productList").empty();
    }

    /*shape list*/

    this.shape_pane_add = function (name, description, url, id) {

        var pane = "<br><div class='item-pane'";
        if (!shape_draw) {
            pane += " onclick='shape_grammar_controller.view_shape(\"";
            pane += url;
            pane += "\")'";
        }
        pane += "><div class='information-pane'><h3>";
        pane += name;
        pane += "<small>";
        pane += description;
        pane += "</small></h3>";
        if (shape_draw) {
            pane += "<div class='shape-viewer' id='";
            pane += id;
            pane += "'></div>";
        }
        pane += "</div></div>";

        $("#tab_shapeList").append(pane);
    }

    this.shape_pane_clear = function () {

        $("#tab_shapeList").empty();

        while (sketchpad_list.length > 0) {
            sketchpad_list.pop();
        }
    }

    this.sketchpad_add = function (obj) {

        sketchpad_list.push(obj);
    }

    this.shape_sketchpad_refresh = function () {

        for (var i = 0; i < sketchpad_list.length; i++)
            sketchpad_list[i].onWindowResize();
    }

    /*rule list*/

    this.rule_pane_add = function (i, description, from, to) {

        var pane = "<br><div class='item-pane'><div class='information-pane'><h3>RULE - ";
        pane += i;
        pane += "</h3><table class='table table-bordered'><caption>";
        pane += description;
        pane += "</caption><tbody><tr class='success'><td>From</td><td>";
        pane += from;
        pane += "</td></tr><tr class='success'><td>To</td><td>";
        pane += to;
        pane += "</td></tr></tbody></table></div></div>";

        $("#tab_ruleList").append(pane);

    }

    this.rule_pane_clear = function () {

        $("#tab_ruleList").empty();
    }

    /*XMLviewer*/

    this.XMLviewer_update = function (str) {

        XMLviewer_clear();
        $("#XML_viewer").append("<pre class='prettyprint lang-xml'></pre>");
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
        str = str.replace(/	/g, "&nbsp;&nbsp;&nbsp;");
        XMLviewer_append(str);
        prettyPrint();
    }

    function XMLviewer_append (str) {

        $("#XML_viewer pre").append(str);
        $("#XML_viewer pre").append("<br>");
    }

    function XMLviewer_clear () {

        $("#XML_viewer").empty();
    }
}