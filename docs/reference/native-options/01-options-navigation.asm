; READ-ONLY STATIC EVIDENCE. Never executed.
; Input SHA256 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; VA addresses, image base 0x400000. Gaps between spans are omitted.
; Disassembly is evidence for branches, not observed screen pixels.

; Span 0x4dd7d0 <= VA < 0x4dd830

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004dd7d0 <.text+0xdc7d0>:
  4dd7d0:	51                   	push   ecx
  4dd7d1:	a1 98 d2 a3 00       	mov    eax,ds:0xa3d298
  4dd7d6:	56                   	push   esi
  4dd7d7:	85 c0                	test   eax,eax
  4dd7d9:	c7 44 24 04 00 00 00 	mov    DWORD PTR [esp+0x4],0x0
  4dd7e0:	00
  4dd7e1:	74 36                	je     0x4dd819
  4dd7e3:	83 f8 05             	cmp    eax,0x5
  4dd7e6:	74 31                	je     0x4dd819
  4dd7e8:	83 f8 04             	cmp    eax,0x4
  4dd7eb:	75 1e                	jne    0x4dd80b
  4dd7ed:	a1 48 d5 a3 00       	mov    eax,ds:0xa3d548
  4dd7f2:	6a 00                	push   0x0
  4dd7f4:	85 c0                	test   eax,eax
  4dd7f6:	ba a0 d8 4d 00       	mov    edx,0x4dd8a0
  4dd7fb:	74 07                	je     0x4dd804
  4dd7fd:	b9 ba 0b 00 00       	mov    ecx,0xbba
  4dd802:	eb 21                	jmp    0x4dd825
  4dd804:	b9 ff 00 00 00       	mov    ecx,0xff
  4dd809:	eb 1a                	jmp    0x4dd825
  4dd80b:	6a 00                	push   0x0
  4dd80d:	ba a0 d8 4d 00       	mov    edx,0x4dd8a0
  4dd812:	b9 ba 0b 00 00       	mov    ecx,0xbba
  4dd817:	eb 0c                	jmp    0x4dd825
  4dd819:	6a 00                	push   0x0
  4dd81b:	ba a0 d8 4d 00       	mov    edx,0x4dd8a0
  4dd820:	b9 b5 00 00 00       	mov    ecx,0xb5
  4dd825:	e8 e6 1d 12 00       	call   0x5ff610
  4dd82a:	8b f0                	mov    esi,eax
  4dd82c:	85 f6                	test   esi,esi
  4dd82e:	74 3f                	je     0x4dd86f

; Span 0x4ddbb6 <= VA < 0x4ddbdd

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004ddbb6 <.text+0xdcbb6>:
  4ddbb6:	85 ed                	test   ebp,ebp
  4ddbb8:	0f 85 0b 02 00 00    	jne    0x4dddc9
  4ddbbe:	5f                   	pop    edi
  4ddbbf:	c7 05 48 0d a4 00 05 	mov    DWORD PTR ds:0xa40d48,0x5
  4ddbc6:	00 00 00
  4ddbc9:	5e                   	pop    esi
  4ddbca:	c7 03 01 00 00 00    	mov    DWORD PTR [ebx],0x1
  4ddbd0:	5d                   	pop    ebp
  4ddbd1:	33 c0                	xor    eax,eax
  4ddbd3:	5b                   	pop    ebx
  4ddbd4:	81 c4 14 06 00 00    	add    esp,0x614
  4ddbda:	c2 10 00             	ret    0x10

; Span 0x4cf94a <= VA < 0x4cf96c

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004cf94a <.text+0xce94a>:
  4cf94a:	a0 58 09 a4 00       	mov    al,ds:0xa40958
  4cf94f:	83 c4 10             	add    esp,0x10
  4cf952:	3c 01                	cmp    al,0x1
  4cf954:	ba 00 fc 4c 00       	mov    edx,0x4cfc00
  4cf959:	6a 00                	push   0x0
  4cf95b:	b9 bb 0b 00 00       	mov    ecx,0xbbb
  4cf960:	74 05                	je     0x4cf967
  4cf962:	b9 f5 00 00 00       	mov    ecx,0xf5
  4cf967:	e8 a4 fc 12 00       	call   0x5ff610

; Span 0x4cff25 <= VA < 0x4cffa4

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004cff25 <.text+0xcef25>:
  4cff25:	8b df                	mov    ebx,edi
  4cff27:	6a 08                	push   0x8
  4cff29:	56                   	push   esi
  4cff2a:	c1 eb 10             	shr    ebx,0x10
  4cff2d:	ff 15 8c a4 79 00    	call   DWORD PTR ds:0x79a48c ; USER32.dll!GetWindowLongA
  4cff33:	81 e7 ff ff 00 00    	and    edi,0xffff
  4cff39:	81 ef 2c 05 00 00    	sub    edi,0x52c
  4cff3f:	74 40                	je     0x4cff81
  4cff41:	4f                   	dec    edi
  4cff42:	74 17                	je     0x4cff5b
  4cff44:	81 ef 59 01 00 00    	sub    edi,0x159
  4cff4a:	75 52                	jne    0x4cff9e
  4cff4c:	5f                   	pop    edi
  4cff4d:	5e                   	pop    esi
  4cff4e:	c7 00 01 00 00 00    	mov    DWORD PTR [eax],0x1
  4cff54:	5d                   	pop    ebp
  4cff55:	33 c0                	xor    eax,eax
  4cff57:	5b                   	pop    ebx
  4cff58:	c2 10 00             	ret    0x10
  4cff5b:	85 db                	test   ebx,ebx
  4cff5d:	75 3f                	jne    0x4cff9e
  4cff5f:	80 3d 58 09 a4 00 01 	cmp    BYTE PTR ds:0xa40958,0x1
  4cff66:	75 36                	jne    0x4cff9e
  4cff68:	5f                   	pop    edi
  4cff69:	c7 05 48 0d a4 00 06 	mov    DWORD PTR ds:0xa40d48,0x6
  4cff70:	00 00 00
  4cff73:	5e                   	pop    esi
  4cff74:	c7 00 01 00 00 00    	mov    DWORD PTR [eax],0x1
  4cff7a:	5d                   	pop    ebp
  4cff7b:	33 c0                	xor    eax,eax
  4cff7d:	5b                   	pop    ebx
  4cff7e:	c2 10 00             	ret    0x10
  4cff81:	85 db                	test   ebx,ebx
  4cff83:	75 19                	jne    0x4cff9e
  4cff85:	80 3d 58 09 a4 00 01 	cmp    BYTE PTR ds:0xa40958,0x1
  4cff8c:	75 10                	jne    0x4cff9e
  4cff8e:	c7 05 48 0d a4 00 04 	mov    DWORD PTR ds:0xa40d48,0x4
  4cff95:	00 00 00
  4cff98:	c7 00 01 00 00 00    	mov    DWORD PTR [eax],0x1
  4cff9e:	33 c0                	xor    eax,eax
  4cffa0:	5f                   	pop    edi
  4cffa1:	5e                   	pop    esi
  4cffa2:	5d                   	pop    ebp
  4cffa3:	5b                   	pop    ebx

; Span 0x481950 <= VA < 0x4819bc

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

00481950 <.text+0x80950>:
  481950:	3b c5                	cmp    eax,ebp
  481952:	0f 84 11 02 00 00    	je     0x481b69
  481958:	eb a6                	jmp    0x481900
  48195a:	e8 71 be 05 00       	call   0x4dd7d0
  48195f:	a1 48 0d a4 00       	mov    eax,ds:0xa40d48
  481964:	83 f8 01             	cmp    eax,0x1
  481967:	eb e1                	jmp    0x48194a
  481969:	8d 4c 24 10          	lea    ecx,[esp+0x10]
  48196d:	e8 ae df 04 00       	call   0x4cf920
  481972:	a1 48 0d a4 00       	mov    eax,ds:0xa40d48
  481977:	83 f8 05             	cmp    eax,0x5
  48197a:	75 d4                	jne    0x481950
  48197c:	b8 01 00 00 00       	mov    eax,0x1
  481981:	a3 48 0d a4 00       	mov    ds:0xa40d48,eax
  481986:	e9 75 ff ff ff       	jmp    0x481900
  48198b:	8d 4c 24 0f          	lea    ecx,[esp+0xf]
  48198f:	e8 3c 73 20 00       	call   0x688cd0
  481994:	b8 05 00 00 00       	mov    eax,0x5
  481999:	a3 48 0d a4 00       	mov    ds:0xa40d48,eax
  48199e:	e9 5d ff ff ff       	jmp    0x481900
  4819a3:	b9 18 0b a4 00       	mov    ecx,0xa40b18
  4819a8:	e8 b3 89 15 00       	call   0x5da360
  4819ad:	b8 05 00 00 00       	mov    eax,0x5
  4819b2:	a3 48 0d a4 00       	mov    ds:0xa40d48,eax
  4819b7:	e9 44 ff ff ff       	jmp    0x481900

; Span 0x688cf8 <= VA < 0x688d21

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

00688cf8 <.text+0x287cf8>:
  688cf8:	a0 58 09 a4 00       	mov    al,ds:0xa40958
  688cfd:	83 c4 10             	add    esp,0x10
  688d00:	84 c0                	test   al,al
  688d02:	c6 05 b0 cf ab 00 00 	mov    BYTE PTR ds:0xabcfb0,0x0
  688d09:	6a 00                	push   0x0
  688d0b:	ba a0 8d 68 00       	mov    edx,0x688da0
  688d10:	b9 d6 00 00 00       	mov    ecx,0xd6
  688d15:	74 05                	je     0x688d1c
  688d17:	b9 b8 00 00 00       	mov    ecx,0xb8
  688d1c:	e8 ef 68 f7 ff       	call   0x5ff610

; Span 0x5da360 <= VA < 0x5da37b

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

005da360 <.text+0x1d9360>:
  5da360:	51                   	push   ecx
  5da361:	56                   	push   esi
  5da362:	6a 00                	push   0x0
  5da364:	ba a0 97 5d 00       	mov    edx,0x5d97a0
  5da369:	b9 a3 00 00 00       	mov    ecx,0xa3
  5da36e:	c7 44 24 08 ff ff ff 	mov    DWORD PTR [esp+0x8],0xffffffff
  5da375:	ff
  5da376:	e8 95 52 02 00       	call   0x5ff610
