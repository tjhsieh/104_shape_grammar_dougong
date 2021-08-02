/*
    指令相關物件
*/

function command(obj, new_tree, main_draw) {

    /*初始化*/
    
    this.source = obj.source;
    this.type = obj.type;
    this.id = obj.id;
    this.rule_id = obj.rule_id;
    this.main_draw = main_draw;
    this.new_tree = new_tree.to;
    this.old_tree;

    if (obj.type == "child")
        this.old_tree = obj.source.child[obj.id];
    else
        this.old_tree = obj.source.brother[obj.id];

    if (this.new_tree != null && this.old_tree != null)
        if (this.new_tree.action == "")
            this.new_tree.action = this.old_tree.action;

    connect(this.old_tree, this.new_tree);

    /*function*/

    function connect(old_node, new_node) {

        if (old_node == null || old_node == undefined) //初始型
            return;

        if (new_node == null || new_node == undefined)
            return;

        for (var i in old_node.child) {

            if (old_node.child[i] != null && old_node.child[i] != undefined) {
                if (new_node.child[i] == null || new_node.child[i] == undefined)
                    new_node.child[i] = old_node.child[i];
                else
                    connect(old_node.child[i], new_node.child[i]);
            }
        }

        for (var i in old_node.brother) {

            if (old_node.brother[i] != null && old_node.brother[i] != undefined) {
                if (new_node.brother[i] == null || new_node.brother[i] == undefined)
                    new_node.brother[i] = old_node.brother[i];
                else
                    connect(old_node.brother[i], new_node.brother[i]);
            }
        }

    }

}

command.prototype.do = function () {
    
    if (this.type == "child")
        this.source.child[this.id] = this.new_tree;
    else
        this.source.brother[this.id] = this.new_tree;

    if (this.old_tree != null && this.old_tree != undefined)
        this.old_tree.remove_draw(this.main_draw);

    if (this.new_tree != null && this.new_tree != undefined)
        this.new_tree.append_draw(this.main_draw);
}

command.prototype.undo = function () {

    if (this.type == "child")
        this.source.child[this.id] = this.old_tree;
    else
        this.source.brother[this.id] = this.old_tree;

    if (this.new_tree != null && this.new_tree != undefined)
        this.new_tree.remove_draw(this.main_draw);

    if (this.old_tree != null && this.old_tree != undefined)
        this.old_tree.append_draw(this.main_draw);
}