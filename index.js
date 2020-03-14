$(document).on("shown.bs.modal", ".modal", function() {
    $(this).find('[data-focus=true]').focus();
});


function parseDiemDanhDate(date) {
    return date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();
}

function loadDiemDanh(date) {
    var path = curentHocSinhPath + "/diemdanh/" + parseDiemDanhDate(date);
    if (database) {
        database.ref(path).once("value", function(snapshot) {
            $("#chkDiemDanh").prop("checked", snapshot.toJSON() ? true : false);
        });
    }
}

$('#dateDiemDanh').datepicker({})
    .on("changeDate", function(e) {
        loadDiemDanh(e.date);
    });

$("#chkDiemDanh").on("change", function() {
    var date = $('#dateDiemDanh').datepicker("getDate");
    diemDanh(date, this.checked);
});

function diemDanh(date, flag) {
    if (database && curentHocSinhPath) {
        database.ref(curentHocSinhPath + "/diemdanh/" + parseDiemDanhDate(date)).set(flag);
    }
}

var BREADCRUMB = [{
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
    },
    {
        "name": "Học Sinh",
        "code": "hocsinh",
    }
];

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
});

function renderBreadcrumb(code, path, title, danh_sach_cho) {
    console.log("code", code);
    var breadcrumbs = [];
    var paths = path.split("/");
    var prevIndex = -1;
    var flag = false;
    for (var k in BREADCRUMB) {
        if (danh_sach_cho && (BREADCRUMB[k].code == "buoi" || BREADCRUMB[k].code == "gio")) {
            continue;
        }
        var p = paths.slice(0, k * 2 + 1);
        BREADCRUMB[k].path = p;
        if (BREADCRUMB[k].code == code) {
            flag = true;
            if (prevIndex > -1 && title !== undefined) {
                BREADCRUMB[prevIndex].title = title;
            }
        } else {
            prevIndex = k;
        }
        if (flag) {
            BREADCRUMB[k].title = undefined;
        }
    }

    var htmls = [];
    var active = null;
    $.each(BREADCRUMB, function(idx, d) {
        if (danh_sach_cho && (d.code == "buoi" || d.code == "gio")) {
            return;
        }
        htmls.push('<li class="breadcrumb-item"><a href="#" title="',
            d.name, d.title !== undefined ? (' (' + d.title + ')') : '', '" data-render="', d.code,
            '" data-path="', d.path.join("/"), '">',
            d.name, d.title !== undefined ? (' (' + d.title + ')') : '', '</a></li>');
        active = d;
        if (d.code == code) {
            return false;
        }
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
    var htmls = ['<a href="#" class="nav-link" data-render="khuvuc" data-path="KhuVuc">',
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
            htmls.push('<li class="nav-item"><a href="" data-render="lop" data-path="KhuVuc/data/', idx,
                '" data-title="', d.name, '"',
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
                                '<button class="btn btn-success btn-action" data-render="lop" data-path="',
                                currentPath + "/data/" + row.id, '" data-title="', row.name, '"',
                                ' title="Danh Sách Lớp Học"><i class="fas fa-search"></i></button>',
                                '<button class="btn btn-secondary btn-action btn-edit-khuvuc" title="Chỉnh Sửa"><i class="fas fa-edit"></i></button>',
                                '<button class="btn btn-danger btn-action btn-remove-khuvuc" title="Xóa"><i class="fas fa-times"></i></button>',
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
    var ele = $("#tableLop");
    if (ele.length == 0) {
        $("#mainContent").empty();
        $('<table id="tableLop" class="table table-bordered table-hover custom-table"></table>')
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
                            var htmls = [];
                            if (row.lop_hoc_cho) {
                                htmls.push('<button class="btn btn-success btn-action" data-render="hocsinh" data-path="',
                                    currentPath + "/data/" + row.id, '" data-danh-sach-cho="true" data-title="', row.name, '"',
                                    '" title="Danh Sách Giờ Học"><i class="fas fa-search"></i></button>');
                            } else {
                                htmls.push('<button class="btn btn-success btn-action" data-render="buoi" data-path="',
                                    currentPath + "/data/" + row.id, '" data-title="', row.name, '"',
                                    '" title="Danh Sách Giờ Học"><i class="fas fa-search"></i></button>');
                            }

                            htmls.push('<button class="btn btn-secondary btn-action btn-edit-lop" title="Chỉnh Sửa"><i class="fas fa-edit"></i></button>',
                                '<button class="btn btn-danger btn-action btn-remove-lop" title="Xóa"><i class="fas fa-times"></i></button>',
                            );
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

function renderBuoi(data) {
    var ele = $("#tableBuoi");
    if (ele.length == 0) {
        $("#mainContent").empty();
        $('<table id="tableBuoi" class="table table-bordered table-hover custom-table"></table>')
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
                                '<button class="btn btn-success btn-action" data-render="gio" data-path="',
                                currentPath + "/data/" + row.id, '" data-title="', row.name, '"',
                                '" title="Danh Sách Giờ Học"><i class="fas fa-search"></i></button>',
                                '<button class="btn btn-secondary btn-action btn-edit-lop" title="Chỉnh Sửa"><i class="fas fa-edit"></i></button>',
                                '<button class="btn btn-danger btn-action btn-remove-lop" title="Xóa"><i class="fas fa-times"></i></button>',
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

function renderGio(data) {
    var ele = $("#tableGio");
    if (ele.length == 0) {
        $("#mainContent").empty();
        $('<table id="tableGio" class="table table-bordered table-hover custom-table"></table>')
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
                                '<button class="btn btn-success btn-action" data-render="hocsinh" data-path="',
                                currentPath + "/data/" + row.id, '" data-title="', row.name, '"',
                                '" title="Danh Sách Học Sinh"><i class="fas fa-search"></i></button>',
                                '<button class="btn btn-secondary btn-action btn-edit-lop" title="Chỉnh Sửa"><i class="fas fa-edit"></i></button>',
                                '<button class="btn btn-danger btn-action btn-remove-lop" title="Xóa"><i class="fas fa-times"></i></button>',
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

function renderHocSinh(data) {
    var ele = $("#tableHocSinh");
    if (ele.length == 0) {
        $("#mainContent").empty();
        $('<table id="tableHocSinh" class="table table-bordered table-hover custom-table"></table>')
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
                                '<button class="btn btn-success btn-action btn-diem-danh" data-path="',
                                currentPath + "/data/" + row.id,
                                '" title="Điểm danh"><i class="far fa-calendar-check"></i></button>',
                                '<button class="btn btn-secondary btn-action btn-edit-hocsinh" title="Chỉnh Sửa"><i class="fas fa-edit"></i></button>',
                                '<button class="btn btn-danger btn-action btn-remove-hocsinh" title="Xóa"><i class="fas fa-times"></i></button>',
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

function showModalKhuVuc(data) {
    $("#modalKhuVuc input[name]").each(function() {
        var field = $(this).attr("name");
        $(this).val(data && data[field] || "");
    });

    $("#modalKhuVuc").modal("show");
}

function showModalLop(data) {
    $("#modalLop input[name]").each(function() {
        var field = $(this).attr("name");
        if (this.type == "checkbox") {
            $(this).prop("checked", data && data[field] ? true : false);
        } else {
            $(this).val(data && data[field] || "");
        }
    });

    $("#modalLop").modal("show");
}

function showModalBuoi(data) {
    $("#modalBuoi input[name]").each(function() {
        var field = $(this).attr("name");
        $(this).val(data && data[field] || "");
    });

    $("#modalBuoi").modal("show");
}

function showModalGio(data) {
    $("#modalGio input[name]").each(function() {
        var field = $(this).attr("name");
        $(this).val(data && data[field] || "");
    });

    $("#modalGio").modal("show");
}

function showModalDiemDanh(data) {
    $("#modalDiemDanh .modal-title").text("Điểm danh - " + data.name);
    var d = new Date();
    $('#dateDiemDanh').datepicker('update', d);
    loadDiemDanh(d);
    $("#modalDiemDanh").modal("show");
}

function showModalHocSinh(data) {
    $("#modalHocSinh input[name]").each(function() {
        var field = $(this).attr("name");
        $(this).val(data && data[field] || "");
    });

    $("#modalHocSinh").modal("show");
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

function removeEventData(path, event) {
    event = event || "value";
    if (database) {
        database.ref(path).off("value");
    }
}

function setEvenData(path, event) {
    event = event || "value";
    if (database) {
        database.ref(path).off("value");
        database.ref(path).on("value", function(snapshot) {
            var data = snapshot.toJSON();
            switch (window.currentType) {
                case "hocsinh":
                    renderHocSinh(data);
                    break;

                case "gio":
                    renderGio(data);
                    break;

                case "buoi":
                    renderBuoi(data);
                    break;

                case "lop":
                    renderLop(data);
                    break;

                default:
                    renderKhuVuc(data);
                    break;
            }
        });
    }
}

$(document).on("click", "[data-render]", function(e) {
    e.preventDefault();
    var code = $(this).attr("data-render");
    window.currentType = code;
    var path = $(this).attr("data-path");

    removeEventData(window.currentPath);
    currentPath = path;
    setEvenData(currentPath);
    console.log(currentPath);
    renderBreadcrumb(code, path, $(this).attr("data-title"), $(this).attr("data-danh-sach-cho"));
});

$(document).on("click", ".btn-add[data-add]", function(e) {
    e.preventDefault();
    var type = $(this).attr("data-add");
    switch (type) {
        case "hocsinh":
            showModalHocSinh();
            break;

        case "gio":
            showModalGio();
            break;

        case "buoi":
            showModalBuoi();
            break;

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

$(document).on("click", ".btn-edit-khuvuc", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data) {
        showModalKhuVuc(data);
    }
});

$(document).on("click", ".btn-remove-khuvuc", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data && database && confirm("Bạn có chắc chắn muốn xóa khu vực này không?")) {
        database.ref(currentPath + "/data/" + data.id).remove();
    }
});

$(document).on("click", ".btn-edit-lop", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data) {
        showModalLop(data);
    }
});

$(document).on("click", ".btn-remove-lop", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data && database && confirm("Bạn có chắc chắn muốn xóa lớp học này không?")) {
        database.ref(currentPath + "/data/" + data.id).remove();
    }
});

$(document).on("click", ".btn-edit-buoi", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data) {
        showModalBuoi(data);
    }
});

$(document).on("click", ".btn-remove-buoi", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data && database && confirm("Bạn có chắc chắn muốn xóa buổi học này không?")) {
        database.ref(currentPath + "/data/" + data.id).remove();
    }
});

$(document).on("click", ".btn-edit-gio", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data) {
        showModalGio(data);
    }
});

$(document).on("click", ".btn-remove-gio", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data && database && confirm("Bạn có chắc chắn muốn xóa giờ học này không?")) {
        database.ref(currentPath + "/data/" + data.id).remove();
    }
});

$(document).on("click", ".btn-edit-hocsinh", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data) {
        showModalHocSinh(data);
    }
});

$(document).on("click", ".btn-remove-hocsinh", function(e) {
    e.preventDefault();
    var data = getRowData(this);
    if (data && database && confirm("Bạn có chắc chắn muốn xóa học sinh này không?")) {
        database.ref(currentPath + "/data/" + data.id).remove();
    }
});

var curentHocSinhPath;
$(document).on("click", ".btn-diem-danh", function() {
    var data = getRowData(this);
    if (data) {
        curentHocSinhPath = $(this).attr("data-path");
        showModalDiemDanh(data);
    }
});

$("#modalKhuVuc form").on("submit", function(e) {
    e.preventDefault();
    var name = trim($(this).find("input[name=name]").val());
    var id = trim($(this).find("input[name=id]").val());
    if (name) {
        if (id) {
            var item = database.ref(currentPath + "/data/" + id).set({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Cập nhật khu vực thành công',
            });
        } else {
            var item = database.ref(currentPath + "/data").push({
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

$("#modalLop form").on("submit", function(e) {
    e.preventDefault();
    var name = trim($(this).find("input[name=name]").val());
    var id = trim($(this).find("input[name=id]").val());
    var lop_hoc_cho = $(this).find("input[name=lop_hoc_cho]").prop("checked");
    if (name) {
        if (id) {
            var item = database.ref(currentPath + "/data/" + id).set({
                name: name,
                lop_hoc_cho: lop_hoc_cho,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Cập nhật lớp thành công',
            });
        } else {
            var item = database.ref(currentPath + "/data").push({
                name: name,
                lop_hoc_cho: lop_hoc_cho,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Thêm lớp thành công',
            });
        }
        $("#modalLop").modal("hide");
    }
});

$("#modalBuoi form").on("submit", function(e) {
    e.preventDefault();
    var name = trim($(this).find("input[name=name]").val());
    var id = trim($(this).find("input[name=id]").val());
    if (name) {
        if (id) {
            var item = database.ref(currentPath + "/data/" + id).set({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Cập nhật buổi học thành công',
            });
        } else {
            var item = database.ref(currentPath + "/data").push({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Thêm buổi học thành công',
            });
        }
        $("#modalBuoi").modal("hide");
    }
});

$("#modalGio form").on("submit", function(e) {
    e.preventDefault();
    var name = trim($(this).find("input[name=name]").val());
    var id = trim($(this).find("input[name=id]").val());
    if (name) {
        if (id) {
            var item = database.ref(currentPath + "/data/" + id).set({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Cập nhật giờ học thành công',
            });
        } else {
            var item = database.ref(currentPath + "/data").push({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Thêm giờ học thành công',
            });
        }
        $("#modalGio").modal("hide");
    }
});

$("#modalHocSinh form").on("submit", function(e) {
    e.preventDefault();
    var name = trim($(this).find("input[name=name]").val());
    var id = trim($(this).find("input[name=id]").val());
    if (name) {
        if (id) {
            var item = database.ref(currentPath + "/data/" + id).set({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Cập nhật học sinh thành công',
            });
        } else {
            var item = database.ref(currentPath + "/data").push({
                name: name,
                modified: firebase.database.ServerValue.TIMESTAMP,
            });
            Toast.fire({
                type: 'success',
                title: 'Thêm học sinh thành công',
            });
        }
        $("#modalHocSinh").modal("hide");
    }
});

$(document).on("click", ".custom-table tr", function(e) {
    $(this).find(".btn-action").first().click();
});

$(document).on("click", ".btn-action", function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
});

var currentType = "khuvuc";
var currentPath = "KhuVuc";


if (database) {
    database.ref("KhuVuc").once("value", function(snapshot) {
        var data = snapshot.toJSON();
        renderKhuVuc(data);
        renderLeftMenu(data);
        renderBreadcrumb("khuvuc", "KhuVuc");
        closePageLoading();

        setEvenData(currentPath);
    });
}