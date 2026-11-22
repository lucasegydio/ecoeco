# Tokens de movimento ecoeco (gerado por 22-movimento/gerar.py). Mola: a=-k(x-alvo)-c·v, massa 1.
class_name EcoMov
const MASSA := 1.0
const REDUZIDO := {"k": 900, "c": 60, "fade_ms": 120}
const MOLAS := {
	"anel-abrir/0": {"k": 110, "c": 17},  # posição, ζ0.81, ~366 ms
	"anel-abrir/1": {"k": 200, "c": 18},  # escala, ζ0.64, ~421 ms
	"anel-fechar/0": {"k": 170, "c": 26},  # posição, ζ1.0, ~447 ms
	"anel-fechar/1": {"k": 220, "c": 24},  # escala, ζ0.81, ~258 ms
	"ima/0": {"k": 140, "c": 22},  # posição (ímã), ζ0.93, ~427 ms
	"bolha-hover/0": {"k": 180, "c": 22},  # hover 1,12, ζ0.82, ~292 ms
	"bolha-hover/1": {"k": 300, "c": 28},  # toque 0,92, ζ0.81, ~221 ms
	"aceitar/0": {"k": 150, "c": 16},  # escolhida, ζ0.65, ~488 ms
	"aceitar/1": {"k": 140, "c": 24},  # outras (absorvem), ζ1.01, ~508 ms
	"aceitar/2": {"k": 120, "c": 14},  # gota, ζ0.64, ~545 ms
	"coletar/0": {"k": 70, "c": 15},  # voo, ζ0.9, ~558 ms
	"coletar/1": {"k": 260, "c": 18},  # chip recebe, ζ0.56, ~361 ms
	"menu/0": {"k": 120, "c": 22},  # folha sobe, ζ1.0, ~539 ms
	"menu/1": {"k": 200, "c": 24},  # indicador da aba, ζ0.85, ~296 ms
	"bestiario/0": {"k": 130, "c": 23},  # célula → ficha, ζ1.01, ~522 ms
	"bestiario/1": {"k": 90, "c": 12},  # foto cai, ζ0.63, ~629 ms
	"camera/0": {"k": 50, "c": 14.1},  # zoom, ζ1.0, ~822 ms
	"evolucao/0": {"k": 80, "c": 14},  # antecipação, ζ0.78, ~405 ms
	"evolucao/1": {"k": 120, "c": 10},  # surgir, ζ0.46, ~757 ms
	"evolucao/2": {"k": 140, "c": 20},  # assentar, ζ0.85, ~351 ms
	"decolagem/0": {"k": 160, "c": 20},  # agacha, ζ0.79, ~291 ms
	"reduzido/0": {"k": 900, "c": 60},  # todas as molas, ζ1.0, ~196 ms
}
const OUTROS := {
	"anel-abrir/stagger_ms": 55,
	"anel-fechar/stagger_ms": 28,
	"ima/estica_max": 0.12,
	"ima/ima_cqi": 1.6,
	"ima/alcance_cqi": 16,
	"ima/inercia": 0.022,
	"aceitar/atraso_gota_ms": 220,
	"coletar/estica_max": 0.12,
	"coletar/arco_px": 36,
	"menu/fade_ms": 180,
	"menu/desloca_px": 10,
	"bestiario/flash_ms": 90,
	"bestiario/giro_graus": -2,
	"eco/periodo_longe_ms": 1800,
	"eco/periodo_perto_ms": 520,
	"eco/treme_max_px": 2.2,
	"eco/arcos_ms": 120,
	"camera/fade_ms": 300,
	"evolucao/flash_ms": 160,
	"evolucao/brilho_ms": 1200,
	"decolagem/estica_max": 0.25,
	"decolagem/aceleracao": 1.4,
	"decolagem/dur_ms": 1700,
	"reduzido/fade_ms": 120,
}

static func mola(id: String, reduzir := false) -> Dictionary:
	return REDUZIDO if reduzir else MOLAS[id]

# passo semi-implícito, igual ao liquid.js
static func passo(p: float, v: float, alvo: float, k: float, c: float, dt: float) -> Vector2:
	v += (-k * (p - alvo) - c * v) * dt
	p += v * dt
	return Vector2(p, v)
