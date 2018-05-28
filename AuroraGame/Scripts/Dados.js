var dado1 = 0;
var dado2 = 0;
var dado3 = 0;
var dado4 = 0;
var dado5 = 0;

var events = new Events();
events.add = function (obj) {
    obj.events = {};
}
events.implement = function (fn) {
    fn.prototype = Object.create(Events.prototype);
}

function Events() {
    this.events = {};
}
Events.prototype.on = function (name, fn) {
    var events = this.events[name];
    if (events == undefined) {
        this.events[name] = [fn];
        this.emit('event:on', fn);
    } else {
        if (events.indexOf(fn) == -1) {
            events.push(fn);
            this.emit('event:on', fn);
        }
    }
    return this;
}
Events.prototype.once = function (name, fn) {
    var events = this.events[name];
    fn.once = true;
    if (!events) {
        this.events[name] = [fn];
        this.emit('event:once', fn);
    } else {
        if (events.indexOf(fn) == -1) {
            events.push(fn);
            this.emit('event:once', fn);
        }
    }
    return this;
}
Events.prototype.emit = function (name, args) {
    var events = this.events[name];
    if (events) {
        var i = events.length;
        while (i--) {
            if (events[i]) {
                events[i].call(this, args);
                if (events[i].once) {
                    delete events[i];
                }
            }
        }
    }
    return this;
}
Events.prototype.unbind = function (name, fn) {
    if (name) {
        var events = this.events[name];
        if (events) {
            if (fn) {
                var i = events.indexOf(fn);
                if (i != -1) {
                    delete events[i];
                }
            } else {
                delete this.events[name];
            }
        }
    } else {
        delete this.events;
        this.events = {};
    }
    return this;
}

var userPrefix;

var prefix = (function () {
    var styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    userPrefix = {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
    };
})();

function bindEvent(element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else {
        element.attachEvent('on' + type, handler);
    }
}

function Viewport(data) {
    events.add(this);

    var self = this;

    this.element = data.element;
    this.fps = data.fps;
    this.sensivity = data.sensivity;
    this.sensivityFade = data.sensivityFade;
    this.touchSensivity = data.touchSensivity;
    this.speed = data.speed;

    this.lastX = 0;
    this.lastY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.distanceX = 0;
    this.distanceY = 0;
    this.positionX = 1122;
    this.positionY = 136;
    this.torqueX = 0;
    this.torqueY = 0;

    this.down = false;
    this.upsideDown = false;

    this.previousPositionX = 0;
    this.previousPositionY = 0;

    this.currentSide = 0;
    this.calculatedSide = 0;

    bindEvent(document, 'mousedown', function () {
        self.down = true;
    });

    bindEvent(document, 'mouseup', function () {
        self.down = false;
    });

    bindEvent(document, 'keyup', function () {
        self.down = false;
    });

    bindEvent(document, 'mousemove', function (e) {
        self.mouseX = e.pageX;
        self.mouseY = e.pageY;
    });

    bindEvent(document, 'touchstart', function (e) {

        self.down = true;
        e.touches ? e = e.touches[0] : null;
        self.mouseX = e.pageX / self.touchSensivity;
        self.mouseY = e.pageY / self.touchSensivity;
        self.lastX = self.mouseX;
        self.lastY = self.mouseY;
    });

    bindEvent(document, 'touchmove', function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        if (e.touches.length == 1) {

            e.touches ? e = e.touches[0] : null;

            self.mouseX = e.pageX / self.touchSensivity;
            self.mouseY = e.pageY / self.touchSensivity;

        }
    });

    bindEvent(document, 'touchend', function (e) {
        self.down = false;
    });

    setInterval(this.animate.bind(this), this.fps);
}

events.implement(Viewport);

Viewport.prototype.animate = function () {

    this.distanceX = (this.mouseX - this.lastX);
    this.distanceY = (this.mouseY - this.lastY);

    this.lastX = this.mouseX;
    this.lastY = this.mouseY;

    if (this.down) {
        this.torqueX = this.torqueX * this.sensivityFade + (this.distanceX * this.speed - this.torqueX) * this.sensivity;
        this.torqueY = this.torqueY * this.sensivityFade + (this.distanceY * this.speed - this.torqueY) * this.sensivity;
    }

    if (Math.abs(this.torqueX) > 1.0 || Math.abs(this.torqueY) > 1.0) {
        if (!this.down) {
            this.torqueX *= this.sensivityFade;
            this.torqueY *= this.sensivityFade;
        }

        this.positionY -= this.torqueY;

        if (this.positionY > 360) {
            this.positionY -= 360;
        } else if (this.positionY < 0) {
            this.positionY += 360;
        }

        if (this.positionY > 90 && this.positionY < 270) {
            this.positionX -= this.torqueX;

            if (!this.upsideDown) {
                this.upsideDown = true;
                this.emit('upsideDown', { upsideDown: this.upsideDown });
            }

        } else {

            this.positionX += this.torqueX;

            if (this.upsideDown) {
                this.upsideDown = false;
                this.emit('upsideDown', { upsideDown: this.upsideDown });
            }
        }

        if (this.positionX > 360) {
            this.positionX -= 360;
        } else if (this.positionX < 0) {
            this.positionX += 360;
        }

        if (!(this.positionY >= 46 && this.positionY <= 130) && !(this.positionY >= 220 && this.positionY <= 308)) {
            if (this.upsideDown) {
                if (this.positionX >= 42 && this.positionX <= 130) {
                    this.calculatedSide = 3;
                } else if (this.positionX >= 131 && this.positionX <= 223) {
                    this.calculatedSide = 2;
                } else if (this.positionX >= 224 && this.positionX <= 314) {
                    this.calculatedSide = 5;
                } else {
                    this.calculatedSide = 4;
                }
            } else {
                if (this.positionX >= 42 && this.positionX <= 130) {
                    this.calculatedSide = 5;
                } else if (this.positionX >= 131 && this.positionX <= 223) {
                    this.calculatedSide = 4;
                } else if (this.positionX >= 224 && this.positionX <= 314) {
                    this.calculatedSide = 3;
                } else {
                    this.calculatedSide = 2;
                }
            }
        } else {
            if (this.positionY >= 46 && this.positionY <= 130) {
                this.calculatedSide = 6;
            }

            if (this.positionY >= 220 && this.positionY <= 308) {
                this.calculatedSide = 1;
            }
        }

        if (this.calculatedSide !== this.currentSide) {
            this.currentSide = this.calculatedSide;
            this.emit('sideChange');
        }
    }

    if (this.element) {
        this.element.style[userPrefix.js + 'Transform'] = 'rotateX(' + this.positionY + 'deg) rotateY(' + this.positionX + 'deg)';

        if (this.positionY != this.previousPositionY || this.positionX != this.previousPositionX) {
            this.previousPositionY = this.positionY;
            this.previousPositionX = this.positionX;

            this.emit('rotate');

        }
    }
}

function Cube(data) {
    var self = this;

    this.element = data.element;
    if (this.element) {
        this.sides = this.element.getElementsByClassName('side');

        this.viewport = data.viewport;
        this.viewport.on('rotate', function () {
            self.rotateSides();
        });
        this.viewport.on('upsideDown', function (obj) {
            self.upsideDown(obj);
        });
        this.viewport.on('sideChange', function () {
            self.sideChange();
        });
    }
}
Cube.prototype.rotateSides = function () {
    var viewport = this.viewport;
    if (viewport.positionY > 90 && viewport.positionY < 270) {
        this.sides[0].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + (viewport.positionX + viewport.torqueX) + 'deg)';
        this.sides[5].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + -(viewport.positionX + 180 + viewport.torqueX) + 'deg)';
    } else {
        this.sides[0].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + (viewport.positionX - viewport.torqueX) + 'deg)';
        this.sides[5].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + -(viewport.positionX + 180 - viewport.torqueX) + 'deg)';
    }
}
Cube.prototype.upsideDown = function (obj) {

    var deg = (obj.upsideDown == true) ? '180deg' : '0deg';
    var i = 5;

    while (i > 0 && --i) {
        this.sides[i].getElementsByClassName('cube-image')[0].style[userPrefix.js + 'Transform'] = 'rotate(' + deg + ')';
    }

}
Cube.prototype.sideChange = function () {

    for (var i = 0; i < this.sides.length; ++i) {
        this.sides[i].getElementsByClassName('cube-image')[0].className = 'cube-image';
    }

    this.sides[this.viewport.currentSide - 1].getElementsByClassName('cube-image')[0].className = 'cube-image active';
}

var viewport1 = new Viewport({
    element: document.getElementById('cube1'),
    fps: 20,
    sensivity: .1,
    sensivityFade: .93,
    speed: 1,
    touchSensivity: 1.5
});

var cube1 = new Cube({
    viewport: viewport1,
    element: document.getElementById('cube1')
});

function ApurarResultado() {
    var _Categoria = $('#Categoria').val();

    var url = "api/apuracao";
    var _dadosApuracao = {
        Categoria: _Categoria, Dados: [{ Valor: dado1 }, { Valor: dado2 }, { Valor: dado3 }, { Valor: dado4 }, { Valor: dado5 }]
    };

    var dados = JSON.stringify(_dadosApuracao);

    $.post(url, _dadosApuracao, function (data) {
        $('#resultadoApuracao').show();
        if (data) {
            $('#resultadoApuracao').text(data);
        }
        else {
            $('#resultadoApuracao').text("Não foi possível realizar a apuração do resultado!");
        }
        $("#btnApurar").prop("disabled", true);
        $("#Categoria").prop("disabled", true);
    });
}

function comecarNovamente() {
    $("#Categoria").prop("disabled", false);
    $('#resultadoApuracao').hide();
    $('#btnGuardar').text("Guardar Dado");
    dado1 = 0;
    dado2 = 0;
    dado3 = 0;
    dado4 = 0;
    dado5 = 0;

    var canvas = document.getElementById("canvas");
    contexto = canvas.getContext('2d');
    contexto.clearRect(0, 0, canvas.width, canvas.height);
}

function GuardarDado() {
    if ($('#btnGuardar').text() == "Começar Novamente")
        comecarNovamente();
    else {
        if (!dado1)
            dado1 = parseInt($('#cube1 div.cube-image.active').text());
        else if (!dado2)
            dado2 = parseInt($('#cube1 div.cube-image.active').text());
        else if (!dado3)
            dado3 = parseInt($('#cube1 div.cube-image.active').text());
        else if (!dado4)
            dado4 = parseInt($('#cube1 div.cube-image.active').text());
        else if (!dado5)
            dado5 = parseInt($('#cube1 div.cube-image.active').text());

        desenharDados();

        if (dado5) {
            $("#btnApurar").prop("disabled", false);
            $('#btnGuardar').text("Começar Novamente");
        }
    }
}

//Desenhar dados jogados
var cWidth = 800; // Variavel contendo a largura da tela
var cHeight = 300; // Variavel contendo a Altura da tela; Tambem usada para apagar a tela, preparando-a para o redesenho
var dIceX = 50; // Variavel contendo a posicao horizontal do unico dado; para apagar a tela preparand-para o redesenho
var dIceY = 50; // Variavel contendo a posicao vertical do unico dado
var dIceWidth = 100; // Variavel contendo a largura da face do dado
var dIceHeight = 100; // Variavel contendo a Altura da face do dado
var dotRad = 6; // Variavel contendo o raio de um ponto
var contexto; // Variavel contendo o CONTEXTO da tela usada em todos os comandos "draw"
var dX; // Variavel usada para posicionamento horizontal modificada para cada uma das faces do dado
var dY; // Variavel usada para posicionamento vertical é mesma para ambas as faces do dado
var firstturn = true; // Variavel Global, inicializaca com valor verdadeiro

function desenharDados() {
    dX = dIceX;
    dY = dIceY;

    if (dado1) {
        drawFace(dado1);
    }

    if (dado2) {
        dX = dIceX + 150;
        drawFace(dado2);
    }

    if (dado3) {
        dX = dIceX + 300;
        drawFace(dado3);
    }

    if (dado4) {
        dX = dIceX + 450;
        drawFace(dado4);
    }

    if (dado5) {
        dX = dIceX + 600;
        drawFace(dado5);
    }
}

function drawFace(n) {
    contexto = document.getElementById("canvas").getContext('2d');
    contexto.lineWidth = 5;
    contexto.clearRect(dX, dY, dIceWidth, dIceHeight);
    contexto.strokeRect(dX, dY, dIceWidth, dIceHeight);

    var dotX;
    var dotY;

    contexto.fillStyle = "#009966";

    switch (n) {
        case 1:
            draw1();
            break;

        case 2:
            draw2();
            break;

        case 3:
            draw2();
            draw1();
            break;

        case 4:
            draw4();
            break;

        case 5:
            draw4();
            draw1();
            break;

        case 6:
            draw4();
            draw2mid();
            break;
    }
}

function draw1() {
    var dotX;
    var dotY;

    contexto.beginPath(); // Inciar o caminho
    dotX = dX + .5 * dIceWidth;
    dotY = dY + .5 * dIceHeight;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);
    contexto.closePath(); // Fecha o caminho
    contexto.fill();
}


function draw2() {
    var dotX;
    var dotY;

    contexto.beginPath(); // Inciar o caminho
    dotX = dX + 3 * dotRad;
    dotY = dY + 3 * dotRad;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    dotX = dX + dIceWidth - 3 * dotRad;
    dotY = dY + dIceHeight - 3 * dotRad;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    contexto.closePath(); // Fecha o caminho
    contexto.fill();
}

function draw4() {
    var dotX;
    var dotY;

    contexto.beginPath(); // Inciar o caminho
    dotX = dX + 3 * dotRad;
    dotY = dY + 3 * dotRad;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    dotX = dX + dIceWidth - 3 * dotRad;
    dotY = dY + dIceHeight - 3 * dotRad;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    contexto.closePath(); // Fecha o caminho
    contexto.fill();

    contexto.beginPath(); // Inciar o caminho
    dotX = dX + 3 * dotRad;
    dotY = dY + dIceHeight - 3 * dotRad;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    dotX = dX + dIceWidth - 3 * dotRad;
    dotY = dY + 3 * dotRad;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    contexto.closePath(); // Fecha o caminho
    contexto.fill();
}

function draw2mid() {
    var dotX;
    var dotY;

    contexto.beginPath(); // Inciar caminho

    dotX = dX + 3 * dotRad;
    dotY = dY + .5 * dIceHeight;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    dotX = dX + dIceWidth - 3 * dotRad;
    dotY = dY + .5 * dIceHeight;

    contexto.arc(dotX, dotY, dotRad, 0, Math.PI * 2, true);

    contexto.closePath(); // Fecha o caminho
    contexto.fill();
}