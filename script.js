window.onload = function () {
  const inicio = document.getElementById("inicio");
  const videoIntro = document.getElementById("videoIntro");
  const elegante = document.getElementById("elegante");
  const musica = document.getElementById("musica");
  const videoFondo = document.getElementById("videoFondoInvitacion");

  // Elementos del reproductor de música
  const reproductorMusica = document.getElementById("reproductorMusica");
  const btnPlayPause = document.getElementById("btnPlayPause");
  const iconoPlay = document.getElementById("iconoPlay");
  const iconoPause = document.getElementById("iconoPause");
  const btnMute = document.getElementById("btnMute");
  const iconoVolumen = document.getElementById("iconoVolumen");
  const iconoMute = document.getElementById("iconoMute");
  const barraProgreso = document.getElementById("barraProgreso");
  const tiempoActualEl = document.getElementById("tiempoActual");
  const tiempoTotalEl = document.getElementById("tiempoTotal");
  const ecualizadorMagico = document.getElementById("ecualizadorMagico");

  let iniciado = false;
  let audioDesbloqueado = false;

  // Formatear segundos a M:SS
  function formatearTiempo(segundos) {
    if (!segundos || isNaN(segundos) || !isFinite(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  }

  // Actualizar la interfaz gráfica del reproductor según el estado del audio
  function actualizarUIReproductor(reproduciendo) {
    if (reproduciendo) {
      if (iconoPlay) iconoPlay.classList.add("oculto");
      if (iconoPause) iconoPause.classList.remove("oculto");
      if (ecualizadorMagico) ecualizadorMagico.classList.add("activo");
      if (reproductorMusica) {
        reproductorMusica.classList.add("reproduciendo");
        reproductorMusica.classList.remove("esperando-toque");
      }
    } else {
      if (iconoPlay) iconoPlay.classList.remove("oculto");
      if (iconoPause) iconoPause.classList.add("oculto");
      if (ecualizadorMagico) ecualizadorMagico.classList.remove("activo");
      if (reproductorMusica) {
        reproductorMusica.classList.remove("reproduciendo");
      }
    }
  }

  // Configurar eventos del elemento <audio> y su reproductor
  if (musica) {
    musica.volume = 0.4;
    musica.loop = true;

    musica.addEventListener("loadedmetadata", () => {
      if (tiempoTotalEl) {
        tiempoTotalEl.textContent = formatearTiempo(musica.duration);
      }
    });

    musica.addEventListener("durationchange", () => {
      if (tiempoTotalEl && musica.duration && isFinite(musica.duration)) {
        tiempoTotalEl.textContent = formatearTiempo(musica.duration);
      }
    });

    musica.addEventListener("timeupdate", () => {
      if (tiempoActualEl) {
        tiempoActualEl.textContent = formatearTiempo(musica.currentTime);
      }
      if (barraProgreso && musica.duration && isFinite(musica.duration)) {
        const porcentaje = (musica.currentTime / musica.duration) * 100;
        barraProgreso.value = porcentaje;
        barraProgreso.style.setProperty("--progreso", `${porcentaje}%`);
      }
    });

    musica.addEventListener("play", () => {
      actualizarUIReproductor(true);
    });

    musica.addEventListener("pause", () => {
      actualizarUIReproductor(false);
    });

    musica.addEventListener("ended", () => {
      actualizarUIReproductor(false);
    });
  }

  // Botón Play / Pause
  if (btnPlayPause && musica) {
    btnPlayPause.addEventListener("click", (e) => {
      e.stopPropagation();
      if (musica.paused) {
        musica.muted = false;
        musica.play().then(() => {
          actualizarUIReproductor(true);
        }).catch((err) => {
          console.log("Error al reproducir manualmente:", err);
        });
      } else {
        musica.pause();
        actualizarUIReproductor(false);
      }
    });
  }

  // Botón Mute / Unmute
  if (btnMute && musica) {
    btnMute.addEventListener("click", (e) => {
      e.stopPropagation();
      musica.muted = !musica.muted;
      if (musica.muted) {
        if (iconoVolumen) iconoVolumen.classList.add("oculto");
        if (iconoMute) iconoMute.classList.remove("oculto");
      } else {
        if (iconoVolumen) iconoVolumen.classList.remove("oculto");
        if (iconoMute) iconoMute.classList.add("oculto");
        if (musica.paused) {
          musica.play().catch(() => {});
        }
      }
    });
  }

  // Barra de progreso interactiva (compatible con touch en iPhone y mouse)
  if (barraProgreso && musica) {
    const actualizarPosicionAudio = () => {
      if (musica.duration && isFinite(musica.duration)) {
        const nuevoTiempo = (barraProgreso.value / 100) * musica.duration;
        musica.currentTime = nuevoTiempo;
        barraProgreso.style.setProperty("--progreso", `${barraProgreso.value}%`);
      }
    };
    barraProgreso.addEventListener("input", actualizarPosicionAudio);
    barraProgreso.addEventListener("change", actualizarPosicionAudio);
  }

  // Desbloquear el canal de audio en iOS Safari dentro del primer gesto del usuario
  function desbloquearAudioIOS() {
    if (!musica || audioDesbloqueado) return;
    musica.muted = true;
    const promesa = musica.play();
    if (promesa !== undefined) {
      promesa
        .then(() => {
          musica.pause();
          musica.currentTime = 0;
          musica.muted = false;
          audioDesbloqueado = true;
        })
        .catch(() => {
          // Si iOS no permite desbloquear en segundo plano, el reproductor superior permitirá darle play con un toque
          musica.muted = false;
        });
    }
  }

  // Función para pasar de la intro a la pantalla principal de la invitación
  function continuarConInvitacion() {
    inicio.style.opacity = "0";
    setTimeout(() => {
      inicio.classList.remove("activa");
      elegante.classList.add("activa");

      if (videoFondo) {
        videoFondo.muted = true;
        videoFondo.setAttribute("playsinline", "");
        videoFondo.setAttribute("webkit-playsinline", "");
        videoFondo.play().catch((e) => console.log("Error video fondo:", e));
      }

      if (musica) {
        musica.muted = false;
        musica.volume = 0.4;
        musica.loop = true;
        const playPromise = musica.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              actualizarUIReproductor(true);
            })
            .catch((e) => {
              console.log("Autoplay bloqueado en iPhone, listo para activar en el reproductor:", e);
              actualizarUIReproductor(false);
              if (reproductorMusica) {
                reproductorMusica.classList.add("esperando-toque");
              }
            });
        }
      }
    }, 1000);
  }

  // Iniciar la experiencia al hacer clic o tocar la pantalla de inicio
  function iniciarExperiencia(e) {
    if (iniciado) return;
    iniciado = true;

    const mensaje = document.getElementById("mensaje");
    if (mensaje) mensaje.style.display = "none";

    // Pre-desbloquear el audio para iPhone/iOS aprovechando el toque del usuario
    desbloquearAudioIOS();

    // Configurar y activar sonido de la intro compatible con iPhone
    if (videoIntro) {
      videoIntro.setAttribute("playsinline", "");
      videoIntro.setAttribute("webkit-playsinline", "");
      videoIntro.muted = false;

      videoIntro.play().catch((error) => {
        console.log("Error al reproducir video intro:", error);
        continuarConInvitacion();
      });

      videoIntro.onended = () => {
        continuarConInvitacion();
      };
    } else {
      continuarConInvitacion();
    }
  }

  inicio.addEventListener("click", iniciarExperiencia);
  inicio.addEventListener("touchend", iniciarExperiencia, { passive: true });

  // ========== CUENTA REGRESIVA EN LA SECCIÓN SIGUIENTE ==========
  // Fecha y hora de Argentina (UTC-03:00): 28/11/2026 a las 22:00.
  const fechaCuenta = new Date("2026-11-28T22:00:00-03:00").getTime();
  const camposCuenta = {
    dias: document.getElementById("diasCuenta"),
    horas: document.getElementById("horasCuenta"),
    minutos: document.getElementById("minutosCuenta"),
    segundos: document.getElementById("segundosCuenta")
  };
  const mensajeCuenta = document.getElementById("mensajeCuenta");
  let intervaloCuenta = null;

  function actualizarCuenta() {
    const diferencia = fechaCuenta - Date.now();
    if (diferencia <= 0) {
      Object.values(camposCuenta).forEach((el) => {
        if (el) el.textContent = "00";
      });
      if (mensajeCuenta) {
        mensajeCuenta.textContent = "¡Llegó el gran día!";
        mensajeCuenta.classList.add("expired");
      }
      if (intervaloCuenta) clearInterval(intervaloCuenta);
      return;
    }
    const total = Math.floor(diferencia / 1000);
    if (camposCuenta.dias) camposCuenta.dias.textContent = String(Math.floor(total / 86400)).padStart(2, "0");
    if (camposCuenta.horas) camposCuenta.horas.textContent = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
    if (camposCuenta.minutos) camposCuenta.minutos.textContent = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    if (camposCuenta.segundos) camposCuenta.segundos.textContent = String(total % 60).padStart(2, "0");
  }
  actualizarCuenta();
  intervaloCuenta = setInterval(actualizarCuenta, 1000);

  // Botón de datos bancarios
  const btnBancarios = document.getElementById("btnBancarios");
  if (btnBancarios) {
    btnBancarios.addEventListener("click", () => {
      const datosDiv = document.getElementById("datosBancarios");
      if (datosDiv) {
        if (datosDiv.style.display === "none" || datosDiv.style.display === "") {
          datosDiv.style.display = "block";
          btnBancarios.textContent = "🙈 OCULTAR DATOS";
        } else {
          datosDiv.style.display = "none";
          btnBancarios.textContent = "💳 DATOS BANCARIOS";
        }
      }
    });
  }

  // Botón de confirmar asistencia
  const btnConfirmar = document.getElementById("btnConfirmar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", (e) => {
      e.preventDefault();
      const mensajeConfirmacion = encodeURIComponent("¡Hola! Quiero confirmar mi asistencia a tus 15 años ✨");
      window.open(`https://wa.me/+5493855162225?text=${mensajeConfirmacion}`, "_blank");
    });
  }

  // Botón de WhatsApp
  const btnWhatsapp = document.getElementById("btnWhatsapp");
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", (e) => {
      e.preventDefault();
      const mensaje = encodeURIComponent("¡Hola! Quiero confirmar mi asistencia a tus 15 años ✨");
      window.open(`https://wa.me/+5493855162225?text=${mensaje}`, "_blank");
    });
  }
};
