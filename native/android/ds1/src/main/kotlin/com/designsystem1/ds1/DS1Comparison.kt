package com.designsystem1.ds1

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription

/** Unknown periods stay distinct from measured zero. A fixed domain can represent percentages. */
class DS1ComparisonValues(current: Double?, previous: Double?, maximum: Double? = null) {
    val current: Double? = current?.takeIf { it.isFinite() }
    val previous: Double? = previous?.takeIf { it.isFinite() }
    val maximum: Double = maximum?.takeIf { it.isFinite() && it > 0 } ?: maxOf(this.current ?: 0.0, this.previous ?: 0.0, 1.0)
    val currentFraction: Double? get() = current?.let { (it / maximum).coerceIn(0.0, 1.0) }
    val previousFraction: Double? get() = previous?.let { (it / maximum).coerceIn(0.0, 1.0) }
}

/** Two horizontal period bars in one square, current blue above previous grey. Missing periods
 * have no track; measured zero keeps its track. [label] describes values and domain to readers. */
@Composable
fun DS1ComparisonBars(current: Double?, previous: Double?, label: String, modifier: Modifier = Modifier, maximum: Double? = null, currentColor: DS1Color = DS1Colors.sharpBlue, previousColor: DS1Color = DS1Colors.textMuted) {
    val values = DS1ComparisonValues(current, previous, maximum)
    val scale = LocalDS1Scale.current
    val track = DS1Colors.fill.current
    val blue = currentColor.current
    val grey = previousColor.current
    if (values.current != null || values.previous != null) {
        Canvas(modifier.fillMaxWidth().height(scale.unit).clearAndSetSemantics { contentDescription = label }) {
            listOf(values.currentFraction, values.previousFraction).forEachIndexed { index, fraction ->
                if (fraction != null) {
                    val top = scale(index * 10f + 2f).toPx()
                    val height = scale(6f).toPx()
                    drawRect(track, Offset(0f, top), Size(size.width, height))
                    drawRect(if (index == 0) blue else grey, Offset(0f, top), Size(size.width * fraction.toFloat(), height))
                }
            }
        }
    }
}
