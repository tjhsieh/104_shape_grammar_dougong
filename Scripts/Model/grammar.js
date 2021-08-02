/*
    節點相關物件
*/

function node(shape,action,draw) {

    /*初始化*/

    this.shape = shape;
    this.brother = [];
    this.child = [];
    this.action = action;
    this.rotate; //= get_rotate(action);
    this.translate; // = get_translate(action);
    this.start;
    this.next;

    /*
    if (this.shape != null) {
        this.start = get_start(this.rotate ,this.translate);
        this.next = get_next(this.rotate, this.translate);
    }
    */

    var model = null;

    if (shape != null && draw) {
        var loader = new THREE.ColladaLoader();
        loader.load(shape.url, function (dae) {

            collada = dae.scene;
            var material = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 });

            collada.traverse(function (child) {
                if (child instanceof THREE.Mesh) {

                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            dae.scene.scale.x = 1;
            dae.scene.scale.y = 1;
            dae.scene.scale.z = 1;

            model = dae;
        });
    }

    /*function*/

    this.get_model = function () {

        return model;
    }

    this.update_data = function () {
        
        this.rotate = get_rotate(this.action);
        this.translate = get_translate(this.action);

        if (this.shape != null) {
            this.start = get_start(this.rotate ,this.translate);
            this.next = get_next(this.rotate, this.translate);
        }
        
    }

    function get_rotate(str) {

        if (str.indexOf("@") == -1)
            return { x: 0, y: 0, z: 0 };

        str = str.replace("#", "");

        var seat = str.indexOf("@");
        var end = str.indexOf("]", seat);

        str = str.slice(seat, end);
        str = str.replace("@", "");
        str = str.replace("[", "");

        var rotation = str.split("|");

        return { x: rotation[0] * Math.PI / 180, y: rotation[1] * Math.PI / 180, z: rotation[2] * Math.PI / 180 };
    }

    function get_translate(str) {

        if (str.indexOf("%") == -1)
            return { x: 0, y: 0, z: 0 };

        str = str.replace("#", "");

        var seat = str.indexOf("%");
        var end = str.indexOf("]", seat);

        str = str.slice(seat, end);
        str = str.replace("%", "");
        str = str.replace("[", "");

        var translation = str.split("|");

        return { x: translation[0] / scale, y: translation[1] / scale, z: translation[2] / scale };
    }

    function get_start(rotate ,translate) {

        return get_new_position(shape.start, rotate, translate);
    }

    function get_next(rotate, translate) {

        var next = [];

        for (var i in shape.next)
            next.push(get_new_position(shape.next[i], rotate, translate));

        return next;
    }

    function get_new_position(pos, rotate, translate) {

        var ans = JSON.parse(JSON.stringify(pos));
        var temp;

        if(rotate.x>0){

            temp = JSON.parse(JSON.stringify(ans));
            ans.y = temp.y * Math.cos(rotate.x) - temp.z * Math.sin(rotate.x);
            ans.z = temp.y * Math.sin(rotate.x) + temp.z * Math.cos(rotate.x);
        }

        if (rotate.y > 0) {

            temp = JSON.parse(JSON.stringify(ans));
            ans.z = temp.z * Math.cos(rotate.y) - temp.x * Math.sin(rotate.y);
            ans.x = temp.z * Math.sin(rotate.y) + temp.x * Math.cos(rotate.y);
        }

        if (rotate.z > 0) {

            temp = JSON.parse(JSON.stringify(ans));
            ans.x = temp.x * Math.cos(rotate.z) - temp.y * Math.sin(rotate.z);
            ans.y = temp.x * Math.sin(rotate.z) + temp.y * Math.cos(rotate.z);
        }
/*
        ans.x += translate.x;
        ans.y += translate.y;
        ans.z += translate.z;
*/
        return ans;
    }
}

node.prototype.append_draw = function (main_draw) {
    
    this.draw_tree(this, main_draw);
}

node.prototype.draw_tree = function (draw_node, main_draw) {

    if (draw_node == null || draw_node == undefined)
        return;

    var model = draw_node.get_model();

    if (model == null)
        return;
    main_draw.add_model(model.scene);

    for (var i in draw_node.child)
        draw_node.draw_tree(draw_node.child[i], main_draw);

    for (var j in draw_node.brother)
        draw_node.draw_tree(draw_node.brother[j], main_draw);
}

node.prototype.remove_draw = function (main_draw) {

    this.remove_tree(this, main_draw);
}

node.prototype.remove_tree = function (draw_node, main_draw) {

    if (draw_node == null || draw_node == undefined)
        return;

    var model = draw_node.get_model();

    if (model == null)
        return;
    main_draw.remove_model(model.scene);

    for (var i in draw_node.child)
        draw_node.remove_tree(draw_node.child[i], main_draw);

    for (var j in draw_node.brother)
        draw_node.remove_tree(draw_node.brother[j], main_draw);
}

/*grammar manager*/

function grammar(initial, shape_manager, rule_manager) {

    /*初始化*/

    var rules_tree = [];
    var tree = new node(null, "", false);
    tree.child.push(string_to_tree(initial, false));

    for (var i in rule_manager.rules) {

        var from = string_to_tree(rule_manager.rules[i].from, false);
        var to = string_to_tree(rule_manager.rules[i].to, false);
        rules_tree.push({ rule_id: i, from: from, to: to });
    }

    /*function*/

    function string_to_tree(str, draw) {
        
        str = str.replace(" ", "");

        /*初始型or忽略*/
        if (str == "" || str == "*")
            return null;

        /*動作+形*/
        if (str.indexOf("=") == -1)
            if (str.indexOf("(") == -1) {
                if (str.indexOf("#") == -1) {

                    var obj = shape_manager.find_first_shape(str);
                    return new node(obj, str.replace(obj.symbol, ""), draw);
                }
            }

        /*RD-NDG(SD,SD) ->  RD   NDG(SD,SD)*/
        if (str.indexOf("=") != -1)
            if (str.indexOf("=") < str.indexOf("(") || str.indexOf("(") == -1) {

                var start = str.indexOf("=");

                var parent = string_to_tree(str.slice(0, start), draw);
                var child = string_to_tree(str.slice(start + 1), draw);

                parent.child.push(child);

                return parent;
            }

        /*RD#NDG(SD,SD) ->  RD   NDG(SD,SD)*/
        if (str.indexOf("#") != -1)
            if (str.indexOf("#") < str.indexOf("(") || str.indexOf("(") == -1) {

                var start = str.indexOf("#");

                var parent = string_to_tree(str.slice(0, start), draw);
                var brother = string_to_tree(str.slice(start + 1), draw);
                brother.action = "#" + brother.action;

                parent.brother.push(brother);

                return parent;
            }

        /*HG(JHD-LG(SD,SD),JHD-LG(SD,SD)) ->   HG   JHD-LG(SD,SD)   JHD-LG(SD,SD)*/
        var left = 0;
        var right = 0;
        var start = 0;
        var end = 0;
        var center = [];
        for (var i = 0; i < str.length; i++) {
            if (str[i] == "(") {
                if (left == 0)
                    start = i;
                left++;
            }
            if (str[i] == ")")
                right++;
            if (str[i] == "," && (left - right) == 1)
                center.push(i);
            if (left != 0 && left == right) {

                end = i;

                var parent = string_to_tree(str.slice(0, start), draw);
                var child;

                parent.child.push(null);

                temp = start;
                for (var j = 0; j < center.length; j++) {

                    child = string_to_tree(str.slice(temp + 1, center[j]), draw);
                    temp = center[j];
                    parent.child.push(child);
                }

                if (center.length > 0)
                    child = string_to_tree(str.slice(center[center.length - 1] + 1, end), draw);
                else    /*沒有","的情形*/
                    child = string_to_tree(str.slice(start + 1, end), draw);
                parent.child.push(child);

                if (str.indexOf("#", end) != -1)
                    if (str.indexOf("=", end) == -1 || str.indexOf("#", end) < str.indexOf("=", end)) {

                        start = str.indexOf("#");

                        if (str.indexOf("=", end) != -1)
                            end = str.indexOf("=", end);
                        else
                            end = str.length;

                        var brother = string_to_tree(str.slice(start + 1,end), draw);
                        brother.action = "#" + brother.action;

                        parent.brother.push(brother);
                    }

                if(str.indexOf("=", end) < end)
                    child = string_to_tree(str.slice(end + 1), draw);
                else
                    child = string_to_tree(str.slice(end + 2), draw);

                parent.child[0] = child;

                return parent;
            }
        }
    }

    function tree_to_string(subtree) {

        if (subtree == null || subtree == undefined)
            return "";

        var str = "";
        
        if(subtree.shape != null)
            str += subtree.action + subtree.shape.symbol;

        for (var i = 0; i < subtree.brother.length; i++)
            str += tree_to_string(subtree.brother[i]);

        if (subtree.child.length > 1) {
            str += "(";
            for (var j = 1; j < subtree.child.length; j++) {
                if (subtree.child[j] == null || subtree.child[j] == undefined)
                    str += "*";
                else
                    str += tree_to_string(subtree.child[j]);
                if (j != (subtree.child.length - 1))
                    str += ",";
            }
            str += ")";
        }

        if (subtree.child.length > 0) 
            if (subtree.child[0] != null && subtree.child[0] != undefined) {

                if (subtree.shape != null)
                    str += "=";
                str += tree_to_string(subtree.child[0]);
            }

        return str;
    }

    this.get_tree_string = function () {

        return tree_to_string(tree);
    }

    this.get_rule_tree = function (rule_id) {

        var from = string_to_tree(rule_manager.rules[rule_id].from, true);
        var to = string_to_tree(rule_manager.rules[rule_id].to, true);
        
        return { rule_id: rule_id, from: from, to: to };
    }

    this.rules_tree_dir = function () {

        console.log("規則樹列表");
        console.dir(rules_tree);
    }

    this.get_next = get_next;
    function get_next() {

        var next_list = [];

        for (var i in rules_tree)
            find_rule(tree, rules_tree[i], next_list);

        return next_list;
    }

    function find_rule(subtree,rules_subtree, next_list) {

        if (subtree == null)
            return;
            
        for (var i in subtree.child) {

            if (compare(subtree.child[i], rules_subtree.from))
                if (!compare(subtree.child[i], rules_subtree.to))
                    next_list.push({ source: subtree, type: "child", id: i, rule_id: rules_subtree.rule_id });

            if (rules_subtree.from != null) /*初始形只檢查一遍*/
                find_rule(subtree.child[i], rules_subtree, next_list);
        }

        for (var j in subtree.brother) {

            if (compare(subtree.brother[j], rules_subtree.from))
                if (!compare(subtree.brother[j], rules_subtree.to))
                    next_list.push({ source: subtree, type: "brother", id: j, rule_id: rules_subtree.rule_id });

            if (rules_subtree.from != null) /*初始形只檢查一遍*/
                find_rule(subtree.brother[j], rules_subtree, next_list);
        }
    }

    function compare(source, template) {

        if (template == null || template == undefined)
            return true;

        if (source == null || source == undefined)
            return false;

        if (source.shape.symbol == template.shape.symbol) {

            for (var i = 0; i < template.child.length; i++)
                if (!compare(source.child[i], template.child[i]))
                    return false;

            for (var i = 0; i < template.brother.length; i++)
                if (!compare(source.brother[i], template.brother[i]))
                    return false;

            return true;
        }
        else
            return false;
    }

    this.update_tree_position = function () {

        update_position(tree, 0, 0, 0);
    }

    function update_position(subtree, x, y, z) {

        if (subtree == null || subtree == undefined)
            return;

        var new_x = x;
        var new_y = y;
        var new_z = z;

        if (subtree.shape != null) {

            subtree.update_data();

            new_x -= subtree.start.x;
            new_y -= subtree.start.y;
            new_z -= subtree.start.z;

            new_x += subtree.translate.x;
            new_y += subtree.translate.y;
            new_z += subtree.translate.z;

            var model = subtree.get_model();

            model.scene.rotation.x = subtree.rotate.x;
            model.scene.rotation.y = subtree.rotate.y;
            model.scene.rotation.z = subtree.rotate.z;

            model.scene.position.x = new_x;
            model.scene.position.y = new_y;
            model.scene.position.z = new_z;

            for (var i in subtree.child)
                update_position(subtree.child[i],
                    new_x + subtree.next[i].x,
                    new_y + subtree.next[i].y,
                    new_z + subtree.next[i].z);
        }
        else {
            for (var i in subtree.child)
                update_position(subtree.child[i], x, y, z);
        }

        for (var j in subtree.brother)
            update_position(subtree.brother[j], x, y, z);
    }
}