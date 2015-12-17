#!/usr/bin/env python

from os import path
from glob import glob


current_dir = path.dirname(__file__)


def main():
    files = [path.basename(f) for f in glob("%s/public/emojis/*.svg" % current_dir)]
    regex_matches = []
    for f in files:
        ucs2_chars = []
        codepoints = f.replace('.svg', '').split('-')
        for codepoint in codepoints:
            unicode_escape = "\\U%s" % codepoint.zfill(8)
            unicode_str = unicode_escape.decode('unicode-escape')
            for char in unicode_str:
                ucs2_chars.append("\\u" + ("%x" % ord(char)).zfill(4))
        regex_matches.append("".join(ucs2_chars))

    sensitive_variant_re = (
        r"(?:(?:\ud83c\udc04|\ud83c\udd70|\ud83c\udd71|\ud83c\udd7e|"
        r"\ud83c\udd7f|\ud83c\ude02|\ud83c\ude1a|\ud83c\ude2f|\ud83c\ude37|"
        r"\u3299|\u303d|\u3030|\u2b55|\u2b50|\u2b1c|\u2b1b|\u2b07|\u2b06|"
        r"\u2b05|\u2935|\u2934|\u27a1|\u2764|\u2757|\u2747|\u2744|\u2734|"
        r"\u2733|\u2716|\u2714|\u2712|\u270f|\u270c|\u2709|\u2708|\u2702|"
        r"\u26fd|\u26fa|\u26f5|\u26f3|\u26f2|\u26ea|\u26d4|\u26c5|\u26c4|"
        r"\u26be|\u26bd|\u26ab|\u26aa|\u26a1|\u26a0|\u2693|\u267f|\u267b|"
        r"\u3297|\u2666|\u2665|\u2663|\u2660|\u2653|\u2652|\u2651|\u2650|"
        r"\u264f|\u264e|\u264d|\u264c|\u264b|\u264a|\u2649|\u2648|\u263a|"
        r"\u261d|\u2615|\u2614|\u2611|\u260e|\u2601|\u2600|\u25fe|\u25fd|"
        r"\u25fc|\u25fb|\u25c0|\u25b6|\u25ab|\u25aa|\u24c2|\u231b|\u231a|"
        r"\u21aa|\u21a9|\u2199|\u2198|\u2197|\u2196|\u2195|\u2194|\u2139|"
        r"\u2122|\u2049|\u203c|\u2668)([\uFE0E\uFE0F]?))")
    inner_re = "|".join(regex_matches)
    print "/((?:%s)|%s)/g" % (inner_re, sensitive_variant_re)


if __name__ == '__main__':
    main()
