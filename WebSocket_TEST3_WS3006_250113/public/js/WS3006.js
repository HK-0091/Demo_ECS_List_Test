$(document).ready(() => {
    console.log("WS3006 JS Connected");
    //$()로 가져온 배열의 이름은 관례상 $value 형식으로 변수 앞에 $추가한다.
    let $tableBody = $(".db_div > table > tbody");
    let $searchBtn = $("#dateSearch_btn");
    let $startDate = $("#startDate");
    let $endDate = $("#endDate");

    let client_DB;
    $.ajax({
        url: "/load_DB",
        type: "GET",
        timeout: 0,
        contentType: "application/json",
        success: function (response) {
            client_DB = response;
            let dbPushPromise = new Promise((resolve, reject) => {
                if (client_DB == response) {
                    resolve("client_DB 정상추가 완료");
                } else {
                    reject("client_DB 정상추가 실패");
                }
            });
            dbPushPromise.then(client_DB.forEach(addTable));
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });

    //db web load
    function addTable(order) {
        //PUG를 사용해도 추가는 HTML로 진행
        //단순 PUG 데이터 추가는 #order.items 같이 사용하여 전달
        const row = `
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>
        `;
        //append는 push 처럼 뒤로 단순 추가(배열아님)
        $tableBody.append(row);
    }

    //테이블 클리어
    function tableClear() {
        $tableBody.empty();
    }

    function filterData() {
        //아래 $startDate.val()등은 문자로 받아진다.
        let startDate = $startDate.val();
        let endDate = $endDate.val();
        if (!startDate || !endDate) {
            alert('조회 날짜를 확인해주세요');
        } else {

            tableClear();

            let filterArray = client_DB.filter((value) => {
                //DB에 productDate는 DATE 타입이며, 자바스크립트로 가져오면 "문자열"로 받아진다.
                //즉, 문자대 문자로 비교하여 값을 출력하는 로직
                return startDate <= value.productDate && endDate >= value.productDate;
            });

            filterArray.forEach(addTable);
        }
    }

    $searchBtn.click(() => {
        filterData()
    });

    //정렬기능
    $(".db_div th").click(function () {
        let $tbody = $(this).parents("table").children("tbody");
        /*
            (tbody)
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>
            형식으로 데이터가 저장되어있다.
        */
        let rows = $tbody.find("tr").toArray();
        /*
            (rows)
            ["
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>",
            "<tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>"
            ]
            형태로 rows에 저장. tbody.find("tr")로만 console.log하면 첫번째 tr 부분만 보여지며, console.log(rows.html())로 봐야함
        */
        let index = $(this).index(); //index는 자동으로 List, Table 등 특정 부모밑에 나열되어있는 값들에 자동으로 index를 부여하여 가져올 수 있다.
        let type = $(this).data("type"); //PUG에 th(data-type = "string")형태로 저장하고 해당 string 부분 가져온다.
        rows.sort((a, b) => {
            let value_A = $(a).find("td").eq(index).text(); //a, b 매개변수에서 a는 배열의 첫 번째(tr)부분을, b는 그 다음(tr)을 가져와 비교한다.
            let value_B = $(b).find("td").eq(index).text(); //rows.sort((a, b)=>{})를 통해 rows의 배열을 순환하며 값을 비교 후 정렬하는 용도이다.
            return type == "number" ? value_A - value_B : value_A.localeCompare(value_B);
            /*
            (return)
            return에 어떤식으로 비교할 것인지에 대한 내용이며, 해당 값을 통해 rows 배열 값을 정렬한다.
            위는 삼항 함수이며 A ? B : C 는 A 조건이 true면 B 아니면 C 를 rows에 return(적용)한다.
            
            return type == "number" ? value_A - value_B : value_A.localeCompare(value_B);
            위 부분은 오름차순으로만 정렬하는 로직이다.(검토필요)
            */
        });
        $(this).toggleClass("asc"); //클릭한 해당 값에 토클 클래스를 통해 asc라는 클래스를 추가 및 삭제한다.
        if ($(this).hasClass("asc")) { //rows.sort 로직으로 일단 오름차순으로 바꾸고 asc 토클클래스를 적용 후 해당 클래스가 적용되어있으면, 오름차순을 역순으로 내림차순으로 바꾼다.
            rows.reverse();
        }
        /*
        tableClear();가 필요 없는 이유
        $(a).find("tr").toArray(); 와 같은 경우는 DOM 요소를 복사해오는 것이 아니라 DOM 요소 자체를 그대로 가져오는 것이라함.
        그렇기에 해당 내용을 sort() 등으로 변경하고 append()를 실행하면 tbody에 있는 요소 자체가 수정된 것이기 때문에 별도의 tableClear() 없이
        변경 요소만이 중복, 추가없이 tbody에 담기게 된다.
        */
        $tbody.append(rows);
        /*
        (tbody.append(rows))
        tbody 값 내에 append를 통한 행 추가는 문자형식으로 
        const row = `
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>
        `;
        이와같이 추가도 가능하고 배열형식으로
        const row = `[
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>,
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.items}</td>
                <td>${order.itemNo}</td>
                <td>${order.lotNo}</td>
                <td>${order.productDate}</td>
                <td>${order.containerNo}</td>
            </tr>
        ]`;
        이렇게 배열로 생성해도 알아서 tbody에 추가된다!! 몰랐던 사실..!
        */
    });
});