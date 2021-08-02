/*
    控制器相關物件
*/

function controller() {

    /*初始化*/

    console.log("初始化controller");

    var shape_manager;
    var rule_manager;
    var ui_manager = new uiManager();
    var main_draw;
    var grammar_manager;

    var command_stack = [];
    var command_redo_stack = [];
    var next_command_list = [];

    main_draw_init();
    event_init();

    load_example(example_file);

    /*function*/

    /*主繪圖區刷新*/

    function main_draw_init() {

        main_draw = new sketchpad("canvas", "主繪圖區");
        main_draw.init(40, 0, 10, -10);
        main_draw.add_stats();
    }

    /*每次動作刷新*/

    function update() {


        update_grammar_string();
        get_next_command();

        if (command_stack.length == 0)
            $("#undo_btn").attr("disabled", true);
        else
            $("#undo_btn").attr("disabled", false);

        if (command_redo_stack.length == 0)
            $("#redo_btn").attr("disabled", true);
        else
            $("#redo_btn").attr("disabled", false);

        grammar_manager.update_tree_position();
        main_draw.render();


        if (next_command_list.length == 0)
            $('#finish_Modal').modal('show');
    }

    /*分析xml*/

    function read_XML(xml) {

        console.log("開始分析xml");

        shape_manager = new shapeManager();
        rule_manager = new ruleManager();

        ui_manager.shape_pane_clear();
        read_XML_shape(xml);
        read_XML_symbol(xml);
        shape_manager.dir();

        ui_manager.rule_pane_clear();
        read_XML_rule(xml);
        rule_manager.dir();

        ui_manager.product_pane_clear();
        read_XML_product(xml);

        var initial = read_XML_initial(xml);
        grammar_manager = new grammar(initial, shape_manager, rule_manager);
        //grammar_manager.rules_tree_dir();

        command_stack_clear();
        command_redo_stack_clear();

        update();

        $('#toolTab li:eq(0) a').tab('show');
    }

    function read_XML_shape(xml) {

        console.log("取得shape相關資訊");

        $(xml).find("shape").each(function (i) {

            var name = $(this).children("name").text();
            var symbol = $(this).children("symbol").text();
            var url = $(this).children("url").text();
            var type = $(this).children("type").text();
            shape_manager.add(name, symbol, url, type);

            ui_manager.shape_pane_add(name, symbol, url, symbol + "_" + i);

            if(shape_draw){
                var shape_sketchpad = new sketchpad(symbol + "_" + i, "形狀:"+name);
                ui_manager.sketchpad_add(shape_sketchpad);
                shape_sketchpad.init(20, 0, 0, 0);
                shape_sketchpad.add_model_by_url(url, 0xff5533);
            }

        });
    }

    function read_XML_symbol(xml) {

        console.log("取得symbol相關資訊");

        $(xml).find("symbols").each(function (i) {
            $(this).find("symbol").each(function (j) {

                var name = $(this).children("name").text();
                var start = $(this).children("start");
                var obj = shape_manager.find_by_symbol(name);

                if (obj == null)
                    return;

                obj.add_start(
                    start.children("x").text() / scale,
                    start.children("y").text() / scale,
                    start.children("z").text() / scale
                );

                $(this).find("next").each(function (k) {

                    obj.add_next(
                        $(this).children("x").text() / scale,
                        $(this).children("y").text() / scale,
                        $(this).children("z").text() / scale
                    );
                });

            });
        });
    }

    function read_XML_rule(xml) {

        console.log("取得rule相關資訊");

        $(xml).find("rule").each(function (i) {

            var from = $(this).children("from").text();
            var to = $(this).children("to").text();
            var description = $(this).children("description").text();
            rule_manager.add(from, to, description);

            ui_manager.rule_pane_add(i, description, from, to);
        });
    }

    function read_XML_product(xml) {

        console.log("取得product相關資訊");

        $(xml).find("product").each(function (i) {

            var name = $(this).children("name").text();
            var description = $(this).children("description").text();
            var url = $(this).children("url").text();
            var grammar = $(this).children("grammar").text();

            ui_manager.product_pane_add(name, description, grammar, "product_" + i);

            var product_sketchpad = new sketchpad("product_" + i, "完成型:" + name);
            ui_manager.sketchpad_add(product_sketchpad);
            product_sketchpad.init(40, 0, 10, -10);
            product_sketchpad.add_model_by_url(url, 0xff5533);

        });
    }

    function read_XML_initial(xml) {

       return $(xml).find("initial").text();
    }

    /*指令相關物件*/

    function command_stack_clear() {

        while (command_stack.length > 0) {
            command_stack.pop();
        }
    }

    function command_redo_stack_clear() {

        while (command_redo_stack.length > 0) {
            command_redo_stack.pop();
        }
    }

    function get_next_command() {

        while (next_command_list.length > 0) {
            next_command_list.pop();
        }

        var list = grammar_manager.get_next();

        ui_manager.grammar_pane_clear();

        for (var i in list) {

            next_command_list.push(new command(list[i], grammar_manager.get_rule_tree(list[i].rule_id), main_draw));

            use_rule = rule_manager.rules[list[i].rule_id];
            ui_manager.grammar_pane_add(list[i].rule_id, use_rule.description, use_rule.from, use_rule.to, i);
        }

    }

    function update_grammar_string() {

        ui_manager.update_grammar_string(grammar_manager.get_tree_string());
    }

    /*載入範例*/

    this.load_example = load_example;
    function load_example(url) {

        console.log("開啟範例檔案");

        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                console.dir(data);
                main_draw_init();
                
                read_XML(data);
                if (typeof data == 'string')
                    ui_manager.XMLviewer_update(data);
                else
                    ui_manager.XMLviewer_update((new XMLSerializer()).serializeToString(data));
            },
            error: function (data) {

                console.error("範例檔案讀取錯誤");
            }
        });
    }

    /*事件相關*/

    function event_init() {

        console.log("初始化事件");

        set_hotkey();

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            ui_manager.shape_sketchpad_refresh();
        });

        window.addEventListener('resize', onWindowResize, false);

    }

    function set_hotkey() {

        $(document).bind('keydown', "shift+l", load_XML);
        $(document).bind('keydown', "shift+s", function () {
            $('#save_stl_Modal').modal('show');
        });
        $(document).bind('keydown', "shift+f4", close);
        $(document).bind('keydown', "ctrl+z", function () {
            undo();
        });
        $(document).bind('keydown', "ctrl+y", function () {
            redo();
        });
        $(document).bind('keydown', "shift+x", function () {
            set_aixs("aixs_x");
        });
        $(document).bind('keydown', "shift+y", function () {
            set_aixs("aixs_y");
        });
        $(document).bind('keydown', "shift+z", function () {
            set_aixs("aixs_z");
        });
        $(document).bind('keydown', "shift+g", set_ground);
        $(document).bind('keydown', "shift+r", set_ground_grid);
        $(document).bind('keydown', "shift+f1", set_help_line);
        $(document).bind('keydown', "shift+f2", set_help_plane);

        $(document).bind('keydown', "alt+h", function () {
            $('#hotkey_Modal').modal('show');
        });
        $(document).bind('keydown', "alt+a", function () {
            $('#about_Modal').modal('show');
        });
    }

    function onWindowResize() {

        main_draw.onWindowResize();
        ui_manager.shape_sketchpad_refresh();
    }

    /*外部呼叫事件*/

    this.load_XML = load_XML;
    function load_XML() {

        $("#XML_file").click();
    }

    this.get_XML = function (event) {

        var file = event.target.files[0];

        var reader = new FileReader();
        reader.onload = function () {

            console.log("開啟xml: " + file.name);

            var data = new DOMParser().parseFromString(this.result, "text/xml");

            main_draw_init();

            read_XML(data);
            ui_manager.XMLviewer_update(this.result);
        }
        reader.readAsText(file);
    }

    this.save_as_STL = function () {

        var name = $("#stl_name").val();
        if (name == "")
            name = "test";
        $("#stl_name").val("");

        main_draw.save_as_STL(name);
    }

    this.close = close;
    function close() {

        window.close();
    }

    this.set_aixs = set_aixs;
    function set_aixs(type) {

        main_draw.set_aixs(type);
    }

    this.set_ground = set_ground;
    function set_ground() {

        main_draw.set_ground();
    }

    this.set_ground_grid = set_ground_grid;
    function set_ground_grid() {

        main_draw.set_ground_grid();
    }

    this.set_help_line = set_help_line;
    function set_help_line() {

        main_draw.set_help_line();
    }

    this.set_help_plane = set_help_plane;
    function set_help_plane() {

        main_draw.set_help_plane();
    }

    this.choose_next = function (id) {

        next_command_list[id].do();
        command_stack.push(next_command_list[id]);

        command_redo_stack_clear();
        update();
    }

    this.undo = undo;
    function undo() {

        if (command_stack.length == 0)
            return;

        var undo_command = command_stack.pop();
        undo_command.undo();
        command_redo_stack.push(undo_command);

        update();
    }

    this.redo = redo;
    function redo() {

        if (command_redo_stack.length == 0)
            return;
        
        var redo_command = command_redo_stack.pop();
        redo_command.do();
        command_stack.push(redo_command);

        update();
    }

    this.view_shape = function (url) {

        window.open('./view_shape.html?url=' + url, '_blank', 'width=800,height=600');
    }
}