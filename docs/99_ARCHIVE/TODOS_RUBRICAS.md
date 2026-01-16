# TODOs - Sistema de Rúbricas

**Estado:** ⚠️ INCOMPLETO - Requiere ESPECIFICACIÓN MAESTRA v1.4

---

## 📋 Contexto

El sistema de rúbricas actual solo tiene **1 subhabilidad** definida de las que deberían existir según los 16 tipos de diagnóstico.

**Tipos de Diagnóstico (16 total):**
- GV_EXP_DEF_FACIL, GV_EXP_FACIL, GV_HA_FACIL_NK, GV_HA_FACIL_SN
- GN_EXP_DEF_FACIL, GN_EXP_FACIL, GN_HA_FACIL_NK, GN_HA_FACIL_SN
- GV_EXP_DEF_DIFICIL, GV_EXP_DIFICIL, GV_HA_DIFICIL_NK, GV_HA_DIFICIL_SN
- GN_EXP_DEF_DIFICIL, GN_EXP_DIFICIL, GN_HA_DIFICIL_NK, GN_HA_DIFICIL_SN

**Subhabilidad actual:**
- `lectura_basica` → Aplica a: GV_HA_FACIL_NK, GV_HA_FACIL_SN

---

## ❓ Preguntas Pendientes (Requieren Especificación)

1. **¿Qué subhabilidades aplican a cada tipo de diagnóstico?**
   - ¿EXP (Explicación) tiene subhabilidades diferentes a HA (Hacer)?
   - ¿FACIL vs DIFICIL tienen subhabilidades diferentes?
   - ¿GV vs GN tienen subhabilidades diferentes?

2. **¿Cuáles son los nombres exactos de las subhabilidades?**
   - Ejemplo actual: "Lectura básica"
   - ¿Hay más? ¿Cuáles son?

3. **¿Las escalas son siempre 1-4 para todas las subhabilidades?**
   - ¿O hay variaciones según el tipo?

4. **¿Hay descripciones o criterios para cada nivel (1-4)?**
   - ¿O solo se guarda el número?

---

## 🎯 Acción Requerida

**ANTES de implementar más subhabilidades:**
1. ✅ Revisar ESPECIFICACIÓN MAESTRA v1.4
2. ✅ Identificar todas las subhabilidades por tipo
3. ✅ Validar escalas y niveles
4. ✅ Documentar mapeo completo

**NO inventar lógica funcional nueva sin especificación.**

---

## 📝 Estructura Preparada

El código está preparado para recibir todas las subhabilidades. Solo falta:
- Definir el array completo de `SUBHABILIDADES`
- Mapear cada subhabilidad a sus tipos de diagnóstico aplicables

**Archivo:** `src/lib/rubricas.ts`

---

## ✅ Lo que SÍ está implementado

- ✅ Tipo `Nivel` (1 | 2 | 3 | 4)
- ✅ Interface `Subhabilidad` con estructura correcta
- ✅ Sistema de filtrado por tipo de diagnóstico
- ✅ Validación de niveles en API
- ✅ Guardado en base de datos

---

**Última actualización:** 2025-01-XX  
**Bloqueado por:** Falta de especificación funcional
