export function horaToMinutes(hora) {
    if (!hora || typeof hora !== 'string' || !hora.includes(':')) return null;
    const [hh, mm] = hora.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
}

export function pickPendiente(ciclosRuta) {
    return ciclosRuta.find(c => !c.horaSalidaReal) || ciclosRuta[ciclosRuta.length - 1] || null;
}
