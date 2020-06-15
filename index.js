class Main {
    static main() {
        //横，縦のマス数
        const width = 168;
        const height = 20;

        //電光掲示板インスタンスを生成
        const eleBoard = new EleBoard(width * (4 * 2), height * (4 * 2));

        //LEDインスタンスを生成
        const ledList = [];
        for(let i = 0; i < height; i++) {
            const tmp = [];
            for(let j = 0; j < width; j++) {
                const led = new LED(i, j);
                led.off();//初期状態はoff
                tmp.push(led);
            }
            ledList.push(tmp);
        }

        
        const scanner = new Scanner();

        document.getElementById("run").addEventListener("click", () => {
            const input = document.getElementById("in").value;
            const result = scanner.scan(input, 20);//入力した文字が.と#の組み合わせになって返ってくる

            for(let i = 0; i < result.length; i++) {
                for(let j = 0; j < result[i].length; j++) {
                    const or = result[i][j];

                    if(or === "#") {
                        ledList[i][j].on("orange");
                    } else {
                        ledList[i][j].off();
                    }
                }
            }
        });
    }
}

//電光掲示板クラス
class EleBoard {
    constructor(width, height) {
        this.canvas = document.getElementById("mainCanvas");
        this.ctx = this.canvas.getContext("2d");

        //canvasのサイズを設定
        this.canvas.width = width;
        this.canvas.height = height;

        //背景は黒
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

//LEDクラス
class LED {
    constructor(i, j) {
        this.i = i;
        this.j = j;

        this.radius = 4;//LEDの半径

        this.x = this.j * (2 * this.radius) + this.radius;//円の中心x座標: j * 直径 + 半径
        this.y = this.i * (2 * this.radius) + this.radius;//円の中心y座標: i * 直径 + 半径

        this.canvas = document.getElementById("mainCanvas");
        this.ctx = this.canvas.getContext("2d");
    }

    on(color = "#101010") {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius - 0.5, 0, 2 * Math.PI);//実際のLEDの半径は0.5小さくする
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    off() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius - 0.5, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#101010";
        this.ctx.fill();
    }
}

//テキストを入力したらドット文字に変換するクラス
class Scanner {
    constructor() {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.style.border = "1px solid black";
        //this.canvas.style.display = "none";
        this.ctx = this.canvas.getContext("2d");
    }

    scan(text, height) {
        this.draw(text);
        const result = this.convert(height);
        return result;
    }

    //canvasを読み取ってドットに変換するメソッド
    //width: 変換後の横マス数, height: 変換後の縦マス数
    convert(length) {
        const dh = this.canvas.height / length;
        const dw = dh;

        //読み取って配列に詰める
        const result = [];

        for(let i = 0; i < length; i++) {
            const tmp = [];
            for(let j = 0; j < Math.floor(this.canvas.width / dw); j++) {
                //そのマスが黒色ならば
                if( this.isOnTheCharacter(dw*j, dh*i, dw, dh, 2) ) {
                    tmp.push("#");
                } else {
                    tmp.push(".");
                }
            }
            result.push(tmp);
        }

        return result;
    }

    //文字をcanvasに描画するメソッド
    draw(text) {
        //canvasの大きさを指定
        this.canvas.width = 100 * text.length;//文字数に合わせて横の長さを変える
        this.canvas.height = 100;

        //読み取りcanvasを白色に染める(透明のままだと黒色判定なので)
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //文字を描画
        this.ctx.font = "95px bold serif";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(text, 0, 77.5, this.canvas.width);
    }

    //指定された範囲で黒の割合が半分以上であればtrueを返すメソッド
    //sx: 開始x座標, sy: 開始y座標, width: 横の長さ, height: 縦の長さ, division: 縦横の分割数(全体の分割数ではない!)
    isOnTheCharacter = (sx, sy, width, height, division) => {
        let blackNum = 0;//黒色の数

        //マスが黒色かどうか調べる
        for(let i = 0; i < division; i++) {
            for(let j = 0; j < division; j++) {
                const x = j * (width / division) + (width / division / 2) + sx;
                const y = i * (height / division) + (height / division / 2) + sy;
                
                const color = this.ctx.getImageData(x, y, 1, 1);

                //色が黒に近ければ
                if(color.data[0] < 10 && color.data[1] < 10 && color.data[2] < 10) {
                    blackNum++;
                }
            }
        }

        //黒色のマスが全体の分割数の半分より多ければ
        if(blackNum >= Math.floor( (division ** 2) / 2 )) {
            return true;
        }
        return false;
    }
}

Main.main();