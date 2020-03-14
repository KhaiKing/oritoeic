const BREADCRUMB = [{
    "name": "Khu Vực",
    "code": "khuvuc",
}, {
    "name": "Lớp",
    "code": "lop",
}, {
    "name": "Buổi",
    "code": "buoi",
}, {
    "name": "Giờ",
    "code": "gio",
}];

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
});



function renderBreadcrumb(code, path) {
    var breadcrumbs = [];
    var paths = path.split("/");
    $.each(BREADCRUMB, function(idx, d) {
        var p = paths.slice(0, idx * 2 + 2);
        d.path = p;
        breadcrumbs.push(d);
        if (d.code == code) {
            return false;
        }
    })

    var htmls = [];
    var active = null;
    $.each(breadcrumbs, function(idx, d) {
        htmls.push('<li class="breadcrumb-item"><a href="#" title="',
            d.name, '" data-render="', d.code,
            '" data-path="', d.path.join("/"), '">',
            d.name, '</a></li>');
        active = d;
    });
    htmls.push('</ol></div>');
    htmls.unshift('<div class="col-sm-6"><ol class="breadcrumb float-sm-right">');
    if (active !== null) {
        htmls.unshift('<div class="row container-fluid">',
            '<div class="col-sm-6">', '<h1 class="m-0 text-dark">',
            "Danh sách " + active.name, ' <a href="" title="Thêm" class="btn-add" data-add="', active.code, '"><i class="fas fa-plus-circle"></i></a></h1>', '</div>');
    }
    htmls.push('</div>');
    $("#breadcrumb").html(htmls.join(""));
}

function renderLeftMenu(data) {
    console.log(data.data);
    var htmls = ['<a href="#" class="nav-link" data-render="khuvuc" data-path="KhuVuc/data">',
        '<i class="nav-icon fas fas fa-globe-asia"></i>',
        '<p>',
        'Khu Vực',
    ];
    if (data && data.data) {
        htmls.unshift('<li class="nav-item has-treeview menu-open">');
        htmls.push('<i class="right fas fa-angle-left"></i>',
            '</p>',
            '</a>',
            '<ul class="nav nav-treeview">');
        $.each(data.data, function(idx, d) {
            htmls.push('<li class="nav-item"><a href="" data-render="lop" data-path="KhuVuc/data/', idx, '/data',
                '" class="nav-link">',
                '<i class="fas fa-chart-pie"></i> ',
                '<p>', d.name, '</p>',
                '</a></li>');
        });
        htmls.push('</ul>')
    } else {
        htmls.unshift('<li class="nav-item">');
        htmls.push('</p>',
            '</a>');
    }

    htmls.push('</li>');

    $("#leftMenu").html(htmls.join(""));
}

function convertToDataTable(data) {
    var r = [];
    $.each(data, function(id, d) {
        d.id = id;
        r.push(d);
    });
    return r;
}

function renderDateTime(v) {
    try {
        var d = new Date(v);
        if (d && d.toJSON() !== null) return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    } catch (error) {}
    return "";
}

function renderKhuVuc(data) {
    var ele = $("#tableKhuVuc");
    if (ele.length == 0) {
        $("#mainContent").empty();
        $('<table id="tableKhuVuc" class="table table-bordered table-hover custom-table"></table>')
            .appendTo("#mainContent").DataTable({
                "paging": true,
                "pageLength": 25,
                "lengthChange": true,
                "searching": true,
                "ordering": true,
                "info": true,
                "autoWidth": false,
                "data": convertToDataTable(data.data),
                "order": [
                    [2, "desc"]
                ],
                "rowCallback": function(row, data, displayNum, displayIndex, dataIndex) {
                    row.cells[0].innerHTML = displayIndex + 1;
                },
                "columns": [{
                        "title": "STT",
                        "name": "stt",
                        "orderable": false,
                        "class": "text-center",
                        "data": function(row, type, set, meta) {
                            return "";
                        }
                    },
                    {
                        "title": "Tên",
                        "name": "name",
                        "class": "td-main",
                        "data": "name",
                    },
                    {
                        "title": "Thời gian chỉnh sửa",
                        "name": "name",
                        "class": "text-center td-nowrap",
                        "data": function(row, type, set, meta) {
                            return renderDateTime(row.modified);
                        }
                    },
                    {
                        "title": "",
                        "name": "",
                        "orderable": false,
                        "class": "text-center td-nowrap",
                        "data": function(row, type, set, meta) {
                            var htmls = [
                                '<button class="btn btn-success btn-action" data-render="lop" data-path="KhuVuc/data/',
                                row.id, '/data',
                                '" title="Danh Sách Lớp Học"><i class="fas fa-search"></i></button>',
                                '<button class="btn btn-secondary btn-action btn-khuvuc" title="Chỉnh Sửa"><i class="fas fa-edit"></i></button>',
                                '<button class="btn btn-danger btn-action btn-xoa-khuvuc" title="Xóa"><i class="fas fa-times"></i></button>',
                            ];
                            return htmls.join("");
                        },
                    }
                ]
            });
    } else {
        var datatable = ele.DataTable();
        datatable.clear();
        datatable.rows.add(convertToDataTable(data.data));
        datatable.draw();
    }
}

function renderLop(data) {
    var htmls = ['<div class="container-fluid">', '<div class="row">'];
    $.each(data, function(idx, d) {

    });
    htmls.push('</div></div>');

    $("#mainContent").html(htmls.join(""));
}

function showModalKhuVuc(data) {
    $("#modalKhuVuc input[name]").each(function() {
        var field = $(this).attr("name");
        $(this).val(data && data[field] || "");
    });

    $("#modalKhuVuc").modal("show");
}

function trim(value) {
    if (value === undefined || value === null) {
        value = "";
    }
    value += "";
    return value.trim();
}

function getListData(path, callback) {
    if (window.database) {
        database.ref(path).once("value", function(snapshot) {
            callback(snapshot.toJSON());
        })
    } else {
        callback(null);
    }
}

$(document).on("click", "[data-render]", function(e) {
    e.preventDefault();
    var code = $(this).attr("data-render");
    window.currentType = code;
    var path = $(this).attr("data-path");
    renderBreadcrumb(code, path);
    switch (window.currentType) {
        case "lop":
            getListData(path, renderLop);
            break;

        default:
            getListData("KhuVuc", renderKhuVuc);
            break;
    }

});

$(document).on("click", ".btn-add[data-add]", function(e) {
    e.preventDefault();
    var type = $(this).attr("data-add");
    switch (type) {
        case "lop":
            showModalLop();
            break;

        default:
            showModalKhuVuc();
            break;
    }
});

function getRowData(dom) {
    var row = $(dom).parents("tr");
    return $(dom).parents("table").DataTable().row(row).data();
}

$(document).on("click", ".btn-khuvuc", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data) {
        showModalKhuVuc(data);
    }
});

$(document).on("click", ".btn-xoa-khuvuc", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data && database && confirm("Bạn có chắc chắn muốn xóa khu vực này không?")) {
        database.ref("KhuVuc/data/" + data.id).remove();
    }
});


$("#modalKhuVuc form").on("submit", function(e) {
    e.preventDefault();
    var name = trim($(this).find("input[name=name]").val());
    var id = trim($(this).find("input[name=id]").val());
    if (name) {
        if (id) {
            var item = database.ref("KhuVuc/data/" + id).set({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Cập nhật khu vực thành công',
            });
        } else {
            var item = database.ref("KhuVuc/data").push({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Thêm khu vực thành công',
            });
        }
        $("#modalKhuVuc").modal("hide");
    }
});

var currentType = "khuvuc";
if (database) {
    database.ref("KhuVuc").on("value", function(snapshot) {
        var data = snapshot.toJSON();
        renderLeftMenu(data);
        switch (currentType) {
            case "lop":
                break;
            default:
                renderKhuVuc(data);
                renderBreadcrumb("khuvuc", "KhuVuc/data");
                break;
        }
        closePageLoading();
    });
}