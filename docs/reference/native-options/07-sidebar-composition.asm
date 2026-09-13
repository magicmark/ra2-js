; READ-ONLY STATIC EVIDENCE. The supplied base-RA2 executable is modified (.detour, xwis.dll).
; Not a clean-retail screenshot, execution trace, or certification.
; Input SHA256: 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; Generated with objdump -d -Mintel --insn-width=16 and explicit VA ranges.

; 0x6f4b00 <= VA < 0x6f4c60: SHP loader and pointer assignments; see placement-formulas.json string table.
  6f4b00:	8b 0d d8 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87d8
  6f4b06:	ba 36 12 ac 00                                  	mov    edx,0xac1236
  6f4b0b:	e8 60 07 da ff                                  	call   0x495270
  6f4b10:	8b 0d dc 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87dc
  6f4b16:	ba 37 12 ac 00                                  	mov    edx,0xac1237
  6f4b1b:	a3 f8 0f ac 00                                  	mov    ds:0xac0ff8,eax
  6f4b20:	e8 4b 07 da ff                                  	call   0x495270
  6f4b25:	8b 0d e0 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87e0
  6f4b2b:	ba 38 12 ac 00                                  	mov    edx,0xac1238
  6f4b30:	a3 c4 10 ac 00                                  	mov    ds:0xac10c4,eax
  6f4b35:	e8 36 07 da ff                                  	call   0x495270
  6f4b3a:	8b 0d e4 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87e4
  6f4b40:	ba 39 12 ac 00                                  	mov    edx,0xac1239
  6f4b45:	a3 bc 10 ac 00                                  	mov    ds:0xac10bc,eax
  6f4b4a:	e8 21 07 da ff                                  	call   0x495270
  6f4b4f:	8b 0d e8 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87e8
  6f4b55:	ba 3a 12 ac 00                                  	mov    edx,0xac123a
  6f4b5a:	a3 5c 10 ac 00                                  	mov    ds:0xac105c,eax
  6f4b5f:	e8 0c 07 da ff                                  	call   0x495270
  6f4b64:	8b 0d ec 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87ec
  6f4b6a:	ba 3b 12 ac 00                                  	mov    edx,0xac123b
  6f4b6f:	a3 f8 10 ac 00                                  	mov    ds:0xac10f8,eax
  6f4b74:	e8 f7 06 da ff                                  	call   0x495270
  6f4b79:	8b 0d f0 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87f0
  6f4b7f:	ba 3c 12 ac 00                                  	mov    edx,0xac123c
  6f4b84:	a3 f0 0f ac 00                                  	mov    ds:0xac0ff0,eax
  6f4b89:	e8 e2 06 da ff                                  	call   0x495270
  6f4b8e:	8b 0d f4 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87f4
  6f4b94:	ba 3d 12 ac 00                                  	mov    edx,0xac123d
  6f4b99:	a3 70 10 ac 00                                  	mov    ds:0xac1070,eax
  6f4b9e:	e8 cd 06 da ff                                  	call   0x495270
  6f4ba3:	8b 0d f8 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87f8
  6f4ba9:	ba 3e 12 ac 00                                  	mov    edx,0xac123e
  6f4bae:	a3 78 10 ac 00                                  	mov    ds:0xac1078,eax
  6f4bb3:	e8 b8 06 da ff                                  	call   0x495270
  6f4bb8:	8b 0d fc 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f87fc
  6f4bbe:	ba 3f 12 ac 00                                  	mov    edx,0xac123f
  6f4bc3:	a3 ec 10 ac 00                                  	mov    ds:0xac10ec,eax
  6f4bc8:	e8 a3 06 da ff                                  	call   0x495270
  6f4bcd:	8b 0d 00 88 7f 00                               	mov    ecx,DWORD PTR ds:0x7f8800
  6f4bd3:	ba 40 12 ac 00                                  	mov    edx,0xac1240
  6f4bd8:	a3 0c 10 ac 00                                  	mov    ds:0xac100c,eax
  6f4bdd:	e8 8e 06 da ff                                  	call   0x495270
  6f4be2:	8b 0d 04 88 7f 00                               	mov    ecx,DWORD PTR ds:0x7f8804
  6f4be8:	ba 41 12 ac 00                                  	mov    edx,0xac1241
  6f4bed:	a3 94 10 ac 00                                  	mov    ds:0xac1094,eax
  6f4bf2:	e8 79 06 da ff                                  	call   0x495270
  6f4bf7:	8b 0d 08 88 7f 00                               	mov    ecx,DWORD PTR ds:0x7f8808
  6f4bfd:	ba 42 12 ac 00                                  	mov    edx,0xac1242
  6f4c02:	a3 58 10 ac 00                                  	mov    ds:0xac1058,eax
  6f4c07:	e8 64 06 da ff                                  	call   0x495270
  6f4c0c:	8b 0d 0c 88 7f 00                               	mov    ecx,DWORD PTR ds:0x7f880c
  6f4c12:	ba 43 12 ac 00                                  	mov    edx,0xac1243
  6f4c17:	a3 48 10 ac 00                                  	mov    ds:0xac1048,eax
  6f4c1c:	e8 4f 06 da ff                                  	call   0x495270
  6f4c21:	8b 0d 10 88 7f 00                               	mov    ecx,DWORD PTR ds:0x7f8810
  6f4c27:	ba 44 12 ac 00                                  	mov    edx,0xac1244
  6f4c2c:	a3 98 10 ac 00                                  	mov    ds:0xac1098,eax
  6f4c31:	e8 3a 06 da ff                                  	call   0x495270
  6f4c36:	8b 0d 14 88 7f 00                               	mov    ecx,DWORD PTR ds:0x7f8814
  6f4c3c:	ba 45 12 ac 00                                  	mov    edx,0xac1245
  6f4c41:	a3 a4 10 ac 00                                  	mov    ds:0xac10a4,eax
  6f4c46:	e8 25 06 da ff                                  	call   0x495270
  6f4c4b:	a3 b0 10 ac 00                                  	mov    ds:0xac10b0,eax
  6f4c50:	c3                                              	ret
  6f4c51:	90                                              	nop
  6f4c52:	90                                              	nop
  6f4c53:	90                                              	nop
  6f4c54:	90                                              	nop
  6f4c55:	90                                              	nop
  6f4c56:	90                                              	nop
  6f4c57:	90                                              	nop
  6f4c58:	90                                              	nop
  6f4c59:	90                                              	nop
  6f4c5a:	90                                              	nop
  6f4c5b:	90                                              	nop
  6f4c5c:	90                                              	nop
  6f4c5d:	90                                              	nop
  6f4c5e:	90                                              	nop
  6f4c5f:	90                                              	nop

; 0x6f4c90 <= VA < 0x6f4f24: Background at0,0. Sequential sidebar rectangles, repeat count, SIDE3/ADDON origins, footer row.
  6f4c90:	83 ec 18                                        	sub    esp,0x18
  6f4c93:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  6f4c98:	53                                              	push   ebx
  6f4c99:	55                                              	push   ebp
  6f4c9a:	56                                              	push   esi
  6f4c9b:	57                                              	push   edi
  6f4c9c:	8b f9                                           	mov    edi,ecx
  6f4c9e:	3d 80 02 00 00                                  	cmp    eax,0x280
  6f4ca3:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  6f4ca7:	89 7c 24 14                                     	mov    DWORD PTR [esp+0x14],edi
  6f4cab:	75 07                                           	jne    0x6f4cb4
  6f4cad:	a1 c4 10 ac 00                                  	mov    eax,ds:0xac10c4
  6f4cb2:	eb 11                                           	jmp    0x6f4cc5
  6f4cb4:	3d 20 03 00 00                                  	cmp    eax,0x320
  6f4cb9:	a1 bc 10 ac 00                                  	mov    eax,ds:0xac10bc
  6f4cbe:	74 05                                           	je     0x6f4cc5
  6f4cc0:	a1 5c 10 ac 00                                  	mov    eax,ds:0xac105c
  6f4cc5:	0f bf 70 02                                     	movsx  esi,WORD PTR [eax+0x2]
  6f4cc9:	0f bf 58 04                                     	movsx  ebx,WORD PTR [eax+0x4]
  6f4ccd:	6a 10                                           	push   0x10
  6f4ccf:	e8 43 d3 08 00                                  	call   0x782017
  6f4cd4:	33 ed                                           	xor    ebp,ebp
  6f4cd6:	83 c4 04                                        	add    esp,0x4
  6f4cd9:	3b c5                                           	cmp    eax,ebp
  6f4cdb:	74 12                                           	je     0x6f4cef
  6f4cdd:	89 28                                           	mov    DWORD PTR [eax],ebp
  6f4cdf:	89 68 04                                        	mov    DWORD PTR [eax+0x4],ebp
  6f4ce2:	89 70 08                                        	mov    DWORD PTR [eax+0x8],esi
  6f4ce5:	89 58 0c                                        	mov    DWORD PTR [eax+0xc],ebx
  6f4ce8:	a3 d4 11 ac 00                                  	mov    ds:0xac11d4,eax
  6f4ced:	eb 06                                           	jmp    0x6f4cf5
  6f4cef:	89 2d d4 11 ac 00                               	mov    DWORD PTR ds:0xac11d4,ebp
  6f4cf5:	a1 f8 10 ac 00                                  	mov    eax,ds:0xac10f8
  6f4cfa:	6a 10                                           	push   0x10
  6f4cfc:	0f bf 58 02                                     	movsx  ebx,WORD PTR [eax+0x2]
  6f4d00:	0f bf 70 04                                     	movsx  esi,WORD PTR [eax+0x4]
  6f4d04:	2b fb                                           	sub    edi,ebx
  6f4d06:	e8 0c d3 08 00                                  	call   0x782017
  6f4d0b:	83 c4 04                                        	add    esp,0x4
  6f4d0e:	3b c5                                           	cmp    eax,ebp
  6f4d10:	74 12                                           	je     0x6f4d24
  6f4d12:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4d14:	89 68 04                                        	mov    DWORD PTR [eax+0x4],ebp
  6f4d17:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4d1a:	89 70 0c                                        	mov    DWORD PTR [eax+0xc],esi
  6f4d1d:	a3 d8 11 ac 00                                  	mov    ds:0xac11d8,eax
  6f4d22:	eb 06                                           	jmp    0x6f4d2a
  6f4d24:	89 2d d8 11 ac 00                               	mov    DWORD PTR ds:0xac11d8,ebp
  6f4d2a:	a1 f0 0f ac 00                                  	mov    eax,ds:0xac0ff0
  6f4d2f:	6a 10                                           	push   0x10
  6f4d31:	0f bf 68 04                                     	movsx  ebp,WORD PTR [eax+0x4]
  6f4d35:	e8 dd d2 08 00                                  	call   0x782017
  6f4d3a:	83 c4 04                                        	add    esp,0x4
  6f4d3d:	85 c0                                           	test   eax,eax
  6f4d3f:	74 12                                           	je     0x6f4d53
  6f4d41:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4d43:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4d46:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4d49:	89 68 0c                                        	mov    DWORD PTR [eax+0xc],ebp
  6f4d4c:	a3 dc 11 ac 00                                  	mov    ds:0xac11dc,eax
  6f4d51:	eb 0a                                           	jmp    0x6f4d5d
  6f4d53:	c7 05 dc 11 ac 00 00 00 00 00                   	mov    DWORD PTR ds:0xac11dc,0x0
  6f4d5d:	8b 0d 70 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac1070
  6f4d63:	03 f5                                           	add    esi,ebp
  6f4d65:	6a 10                                           	push   0x10
  6f4d67:	0f bf 69 04                                     	movsx  ebp,WORD PTR [ecx+0x4]
  6f4d6b:	e8 a7 d2 08 00                                  	call   0x782017
  6f4d70:	83 c4 04                                        	add    esp,0x4
  6f4d73:	85 c0                                           	test   eax,eax
  6f4d75:	74 12                                           	je     0x6f4d89
  6f4d77:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4d79:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4d7c:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4d7f:	89 68 0c                                        	mov    DWORD PTR [eax+0xc],ebp
  6f4d82:	a3 e0 11 ac 00                                  	mov    ds:0xac11e0,eax
  6f4d87:	eb 0a                                           	jmp    0x6f4d93
  6f4d89:	c7 05 e0 11 ac 00 00 00 00 00                   	mov    DWORD PTR ds:0xac11e0,0x0
  6f4d93:	8b 15 78 10 ac 00                               	mov    edx,DWORD PTR ds:0xac1078
  6f4d99:	03 f5                                           	add    esi,ebp
  6f4d9b:	6a 10                                           	push   0x10
  6f4d9d:	0f bf 6a 04                                     	movsx  ebp,WORD PTR [edx+0x4]
  6f4da1:	e8 71 d2 08 00                                  	call   0x782017
  6f4da6:	83 c4 04                                        	add    esp,0x4
  6f4da9:	85 c0                                           	test   eax,eax
  6f4dab:	74 12                                           	je     0x6f4dbf
  6f4dad:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4daf:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4db2:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4db5:	89 68 0c                                        	mov    DWORD PTR [eax+0xc],ebp
  6f4db8:	a3 e8 11 ac 00                                  	mov    ds:0xac11e8,eax
  6f4dbd:	eb 0a                                           	jmp    0x6f4dc9
  6f4dbf:	c7 05 e8 11 ac 00 00 00 00 00                   	mov    DWORD PTR ds:0xac11e8,0x0
  6f4dc9:	a1 ec 10 ac 00                                  	mov    eax,ds:0xac10ec
  6f4dce:	03 f5                                           	add    esi,ebp
  6f4dd0:	6a 10                                           	push   0x10
  6f4dd2:	0f bf 68 04                                     	movsx  ebp,WORD PTR [eax+0x4]
  6f4dd6:	e8 3c d2 08 00                                  	call   0x782017
  6f4ddb:	83 c4 04                                        	add    esp,0x4
  6f4dde:	85 c0                                           	test   eax,eax
  6f4de0:	74 12                                           	je     0x6f4df4
  6f4de2:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4de4:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4de7:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4dea:	89 68 0c                                        	mov    DWORD PTR [eax+0xc],ebp
  6f4ded:	a3 ec 11 ac 00                                  	mov    ds:0xac11ec,eax
  6f4df2:	eb 0a                                           	jmp    0x6f4dfe
  6f4df4:	c7 05 ec 11 ac 00 00 00 00 00                   	mov    DWORD PTR ds:0xac11ec,0x0
  6f4dfe:	8b 0d 94 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac1094
  6f4e04:	6a 10                                           	push   0x10
  6f4e06:	0f bf 69 04                                     	movsx  ebp,WORD PTR [ecx+0x4]
  6f4e0a:	e8 08 d2 08 00                                  	call   0x782017
  6f4e0f:	83 c4 04                                        	add    esp,0x4
  6f4e12:	85 c0                                           	test   eax,eax
  6f4e14:	74 12                                           	je     0x6f4e28
  6f4e16:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4e18:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4e1b:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4e1e:	89 68 0c                                        	mov    DWORD PTR [eax+0xc],ebp
  6f4e21:	a3 f0 11 ac 00                                  	mov    ds:0xac11f0,eax
  6f4e26:	eb 0a                                           	jmp    0x6f4e32
  6f4e28:	c7 05 f0 11 ac 00 00 00 00 00                   	mov    DWORD PTR ds:0xac11f0,0x0
  6f4e32:	8b 15 58 10 ac 00                               	mov    edx,DWORD PTR ds:0xac1058
  6f4e38:	6a 10                                           	push   0x10
  6f4e3a:	0f bf 6a 04                                     	movsx  ebp,WORD PTR [edx+0x4]
  6f4e3e:	e8 d4 d1 08 00                                  	call   0x782017
  6f4e43:	83 c4 04                                        	add    esp,0x4
  6f4e46:	85 c0                                           	test   eax,eax
  6f4e48:	74 12                                           	je     0x6f4e5c
  6f4e4a:	89 38                                           	mov    DWORD PTR [eax],edi
  6f4e4c:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4e4f:	89 58 08                                        	mov    DWORD PTR [eax+0x8],ebx
  6f4e52:	89 68 0c                                        	mov    DWORD PTR [eax+0xc],ebp
  6f4e55:	a3 f4 11 ac 00                                  	mov    ds:0xac11f4,eax
  6f4e5a:	eb 0a                                           	jmp    0x6f4e66
  6f4e5c:	c7 05 f4 11 ac 00 00 00 00 00                   	mov    DWORD PTR ds:0xac11f4,0x0
  6f4e66:	8b 3d f0 11 ac 00                               	mov    edi,DWORD PTR ds:0xac11f0
  6f4e6c:	8b 5c 24 10                                     	mov    ebx,DWORD PTR [esp+0x10]
  6f4e70:	8b c3                                           	mov    eax,ebx
  6f4e72:	8b 0d ec 11 ac 00                               	mov    ecx,DWORD PTR ds:0xac11ec
  6f4e78:	8b 57 0c                                        	mov    edx,DWORD PTR [edi+0xc]
  6f4e7b:	6a 10                                           	push   0x10
  6f4e7d:	2b c2                                           	sub    eax,edx
  6f4e7f:	8b 15 e8 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11e8
  6f4e85:	8b 6a 0c                                        	mov    ebp,DWORD PTR [edx+0xc]
  6f4e88:	8b 15 e0 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11e0
  6f4e8e:	2b c5                                           	sub    eax,ebp
  6f4e90:	8b 6a 0c                                        	mov    ebp,DWORD PTR [edx+0xc]
  6f4e93:	8b 15 dc 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11dc
  6f4e99:	2b c5                                           	sub    eax,ebp
  6f4e9b:	8b 6a 0c                                        	mov    ebp,DWORD PTR [edx+0xc]
  6f4e9e:	8b 15 d8 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11d8
  6f4ea4:	2b c5                                           	sub    eax,ebp
  6f4ea6:	2b 42 0c                                        	sub    eax,DWORD PTR [edx+0xc]
  6f4ea9:	99                                              	cdq
  6f4eaa:	f7 79 0c                                        	idiv   DWORD PTR [ecx+0xc]
  6f4ead:	a3 cc 10 ac 00                                  	mov    ds:0xac10cc,eax
  6f4eb2:	0f af 41 0c                                     	imul   eax,DWORD PTR [ecx+0xc]
  6f4eb6:	03 f0                                           	add    esi,eax
  6f4eb8:	89 77 04                                        	mov    DWORD PTR [edi+0x4],esi
  6f4ebb:	a1 f0 11 ac 00                                  	mov    eax,ds:0xac11f0
  6f4ec0:	8b 15 f4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11f4
  6f4ec6:	8b 48 0c                                        	mov    ecx,DWORD PTR [eax+0xc]
  6f4ec9:	03 ce                                           	add    ecx,esi
  6f4ecb:	8d 73 e0                                        	lea    esi,[ebx-0x20]
  6f4ece:	89 4a 04                                        	mov    DWORD PTR [edx+0x4],ecx
  6f4ed1:	a1 40 96 83 00                                  	mov    eax,ds:0x839640
  6f4ed6:	8b 0d 44 96 83 00                               	mov    ecx,DWORD PTR ds:0x839644
  6f4edc:	8b 3d 48 96 83 00                               	mov    edi,DWORD PTR ds:0x839648
  6f4ee2:	8b 15 4c 96 83 00                               	mov    edx,DWORD PTR ds:0x83964c
  6f4ee8:	89 44 24 1c                                     	mov    DWORD PTR [esp+0x1c],eax
  6f4eec:	89 4c 24 20                                     	mov    DWORD PTR [esp+0x20],ecx
  6f4ef0:	89 54 24 28                                     	mov    DWORD PTR [esp+0x28],edx
  6f4ef4:	81 ef a8 00 00 00                               	sub    edi,0xa8
  6f4efa:	e8 18 d1 08 00                                  	call   0x782017
  6f4eff:	33 ed                                           	xor    ebp,ebp
  6f4f01:	83 c4 04                                        	add    esp,0x4
  6f4f04:	3b c5                                           	cmp    eax,ebp
  6f4f06:	74 16                                           	je     0x6f4f1e
  6f4f08:	89 28                                           	mov    DWORD PTR [eax],ebp
  6f4f0a:	89 70 04                                        	mov    DWORD PTR [eax+0x4],esi
  6f4f0d:	89 78 08                                        	mov    DWORD PTR [eax+0x8],edi
  6f4f10:	c7 40 0c 20 00 00 00                            	mov    DWORD PTR [eax+0xc],0x20
  6f4f17:	a3 fc 11 ac 00                                  	mov    ds:0xac11fc,eax
  6f4f1c:	eb 06                                           	jmp    0x6f4f24
  6f4f1e:	89 2d fc 11 ac 00                               	mov    DWORD PTR ds:0xac11fc,ebp

; 0x6f4620 <= VA < 0x6f4920: Battle compositor: fixed-width background, sidebar pieces; repeats use SIDE2B pointerac100c and SIDE2 rectangleac11ec.
  6f4620:	a0 b0 11 ac 00                                  	mov    al,ds:0xac11b0
  6f4625:	83 ec 28                                        	sub    esp,0x28
  6f4628:	84 c0                                           	test   al,al
  6f462a:	53                                              	push   ebx
  6f462b:	55                                              	push   ebp
  6f462c:	56                                              	push   esi
  6f462d:	57                                              	push   edi
  6f462e:	8b fa                                           	mov    edi,edx
  6f4630:	8b f1                                           	mov    esi,ecx
  6f4632:	75 47                                           	jne    0x6f467b
  6f4634:	e8 c7 04 00 00                                  	call   0x6f4b00
  6f4639:	8b 0d 28 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f8728
  6f463f:	ba a0 11 ac 00                                  	mov    edx,0xac11a0
  6f4644:	68 a4 11 ac 00                                  	push   0xac11a4
  6f4649:	e8 52 d9 ff ff                                  	call   0x6f1fa0
  6f464e:	8b 0d 2c 87 7f 00                               	mov    ecx,DWORD PTR ds:0x7f872c
  6f4654:	ba a8 11 ac 00                                  	mov    edx,0xac11a8
  6f4659:	68 ac 11 ac 00                                  	push   0xac11ac
  6f465e:	e8 3d d9 ff ff                                  	call   0x6f1fa0
  6f4663:	8b 15 e4 23 85 00                               	mov    edx,DWORD PTR ds:0x8523e4
  6f4669:	8b 0d e0 23 85 00                               	mov    ecx,DWORD PTR ds:0x8523e0
  6f466f:	e8 1c 06 00 00                                  	call   0x6f4c90
  6f4674:	c6 05 b0 11 ac 00 01                            	mov    BYTE PTR ds:0xac11b0,0x1
  6f467b:	8b 06                                           	mov    eax,DWORD PTR [esi]
  6f467d:	33 db                                           	xor    ebx,ebx
  6f467f:	53                                              	push   ebx
  6f4680:	8b ce                                           	mov    ecx,esi
  6f4682:	ff 50 18                                        	call   DWORD PTR [eax+0x18]
  6f4685:	a1 d4 11 ac 00                                  	mov    eax,ds:0xac11d4
  6f468a:	89 5c 24 10                                     	mov    DWORD PTR [esp+0x10],ebx
  6f468e:	89 5c 24 14                                     	mov    DWORD PTR [esp+0x14],ebx
  6f4692:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  6f4694:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  6f4698:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  6f469b:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  6f46a0:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  6f46a4:	3d 80 02 00 00                                  	cmp    eax,0x280
  6f46a9:	75 25                                           	jne    0x6f46d0
  6f46ab:	33 c0                                           	xor    eax,eax
  6f46ad:	33 c9                                           	xor    ecx,ecx
  6f46af:	51                                              	push   ecx
  6f46b0:	50                                              	push   eax
  6f46b1:	53                                              	push   ebx
  6f46b2:	8b 0d c4 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac10c4
  6f46b8:	53                                              	push   ebx
  6f46b9:	68 e8 03 00 00                                  	push   0x3e8
  6f46be:	53                                              	push   ebx
  6f46bf:	53                                              	push   ebx
  6f46c0:	53                                              	push   ebx
  6f46c1:	68 00 04 00 00                                  	push   0x400
  6f46c6:	8d 44 24 34                                     	lea    eax,[esp+0x34]
  6f46ca:	57                                              	push   edi
  6f46cb:	50                                              	push   eax
  6f46cc:	53                                              	push   ebx
  6f46cd:	51                                              	push   ecx
  6f46ce:	eb 4e                                           	jmp    0x6f471e
  6f46d0:	3d 20 03 00 00                                  	cmp    eax,0x320
  6f46d5:	75 24                                           	jne    0x6f46fb
  6f46d7:	33 c0                                           	xor    eax,eax
  6f46d9:	33 c9                                           	xor    ecx,ecx
  6f46db:	51                                              	push   ecx
  6f46dc:	50                                              	push   eax
  6f46dd:	53                                              	push   ebx
  6f46de:	a1 bc 10 ac 00                                  	mov    eax,ds:0xac10bc
  6f46e3:	53                                              	push   ebx
  6f46e4:	68 e8 03 00 00                                  	push   0x3e8
  6f46e9:	53                                              	push   ebx
  6f46ea:	53                                              	push   ebx
  6f46eb:	53                                              	push   ebx
  6f46ec:	68 00 04 00 00                                  	push   0x400
  6f46f1:	8d 54 24 34                                     	lea    edx,[esp+0x34]
  6f46f5:	57                                              	push   edi
  6f46f6:	52                                              	push   edx
  6f46f7:	53                                              	push   ebx
  6f46f8:	50                                              	push   eax
  6f46f9:	eb 23                                           	jmp    0x6f471e
  6f46fb:	33 c0                                           	xor    eax,eax
  6f46fd:	33 c9                                           	xor    ecx,ecx
  6f46ff:	51                                              	push   ecx
  6f4700:	50                                              	push   eax
  6f4701:	53                                              	push   ebx
  6f4702:	8b 15 5c 10 ac 00                               	mov    edx,DWORD PTR ds:0xac105c
  6f4708:	53                                              	push   ebx
  6f4709:	68 e8 03 00 00                                  	push   0x3e8
  6f470e:	53                                              	push   ebx
  6f470f:	53                                              	push   ebx
  6f4710:	53                                              	push   ebx
  6f4711:	68 00 04 00 00                                  	push   0x400
  6f4716:	8d 4c 24 34                                     	lea    ecx,[esp+0x34]
  6f471a:	57                                              	push   edi
  6f471b:	51                                              	push   ecx
  6f471c:	53                                              	push   ebx
  6f471d:	52                                              	push   edx
  6f471e:	8b 15 ac 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11ac
  6f4724:	8b ce                                           	mov    ecx,esi
  6f4726:	e8 75 a7 da ff                                  	call   0x49eea0
  6f472b:	a1 d8 11 ac 00                                  	mov    eax,ds:0xac11d8
  6f4730:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  6f4732:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  6f4736:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  6f4739:	33 c9                                           	xor    ecx,ecx
  6f473b:	33 c0                                           	xor    eax,eax
  6f473d:	51                                              	push   ecx
  6f473e:	50                                              	push   eax
  6f473f:	53                                              	push   ebx
  6f4740:	8b 0d f8 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac10f8
  6f4746:	53                                              	push   ebx
  6f4747:	68 e8 03 00 00                                  	push   0x3e8
  6f474c:	53                                              	push   ebx
  6f474d:	53                                              	push   ebx
  6f474e:	53                                              	push   ebx
  6f474f:	68 00 04 00 00                                  	push   0x400
  6f4754:	8d 44 24 34                                     	lea    eax,[esp+0x34]
  6f4758:	57                                              	push   edi
  6f4759:	50                                              	push   eax
  6f475a:	53                                              	push   ebx
  6f475b:	89 54 24 44                                     	mov    DWORD PTR [esp+0x44],edx
  6f475f:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f4765:	51                                              	push   ecx
  6f4766:	8b ce                                           	mov    ecx,esi
  6f4768:	e8 33 a7 da ff                                  	call   0x49eea0
  6f476d:	a1 dc 11 ac 00                                  	mov    eax,ds:0xac11dc
  6f4772:	33 c9                                           	xor    ecx,ecx
  6f4774:	51                                              	push   ecx
  6f4775:	8d 4c 24 14                                     	lea    ecx,[esp+0x14]
  6f4779:	8b 10                                           	mov    edx,DWORD PTR [eax]
  6f477b:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  6f477f:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  6f4782:	89 44 24 18                                     	mov    DWORD PTR [esp+0x18],eax
  6f4786:	33 c0                                           	xor    eax,eax
  6f4788:	50                                              	push   eax
  6f4789:	53                                              	push   ebx
  6f478a:	8b 15 f0 0f ac 00                               	mov    edx,DWORD PTR ds:0xac0ff0
  6f4790:	53                                              	push   ebx
  6f4791:	68 e8 03 00 00                                  	push   0x3e8
  6f4796:	53                                              	push   ebx
  6f4797:	53                                              	push   ebx
  6f4798:	53                                              	push   ebx
  6f4799:	68 00 04 00 00                                  	push   0x400
  6f479e:	57                                              	push   edi
  6f479f:	51                                              	push   ecx
  6f47a0:	53                                              	push   ebx
  6f47a1:	52                                              	push   edx
  6f47a2:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f47a8:	8b ce                                           	mov    ecx,esi
  6f47aa:	e8 f1 a6 da ff                                  	call   0x49eea0
  6f47af:	a1 e0 11 ac 00                                  	mov    eax,ds:0xac11e0
  6f47b4:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  6f47b6:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  6f47ba:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  6f47bd:	33 c9                                           	xor    ecx,ecx
  6f47bf:	33 c0                                           	xor    eax,eax
  6f47c1:	51                                              	push   ecx
  6f47c2:	50                                              	push   eax
  6f47c3:	53                                              	push   ebx
  6f47c4:	8b 0d 70 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac1070
  6f47ca:	53                                              	push   ebx
  6f47cb:	68 e8 03 00 00                                  	push   0x3e8
  6f47d0:	53                                              	push   ebx
  6f47d1:	53                                              	push   ebx
  6f47d2:	53                                              	push   ebx
  6f47d3:	68 00 04 00 00                                  	push   0x400
  6f47d8:	8d 44 24 34                                     	lea    eax,[esp+0x34]
  6f47dc:	57                                              	push   edi
  6f47dd:	50                                              	push   eax
  6f47de:	53                                              	push   ebx
  6f47df:	89 54 24 44                                     	mov    DWORD PTR [esp+0x44],edx
  6f47e3:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f47e9:	51                                              	push   ecx
  6f47ea:	8b ce                                           	mov    ecx,esi
  6f47ec:	e8 af a6 da ff                                  	call   0x49eea0
  6f47f1:	a1 e8 11 ac 00                                  	mov    eax,ds:0xac11e8
  6f47f6:	8b 10                                           	mov    edx,DWORD PTR [eax]
  6f47f8:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  6f47fc:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  6f47ff:	33 c9                                           	xor    ecx,ecx
  6f4801:	89 44 24 14                                     	mov    DWORD PTR [esp+0x14],eax
  6f4805:	33 c0                                           	xor    eax,eax
  6f4807:	51                                              	push   ecx
  6f4808:	50                                              	push   eax
  6f4809:	53                                              	push   ebx
  6f480a:	8b 15 78 10 ac 00                               	mov    edx,DWORD PTR ds:0xac1078
  6f4810:	53                                              	push   ebx
  6f4811:	68 e8 03 00 00                                  	push   0x3e8
  6f4816:	53                                              	push   ebx
  6f4817:	53                                              	push   ebx
  6f4818:	53                                              	push   ebx
  6f4819:	68 00 04 00 00                                  	push   0x400
  6f481e:	8d 4c 24 34                                     	lea    ecx,[esp+0x34]
  6f4822:	57                                              	push   edi
  6f4823:	51                                              	push   ecx
  6f4824:	53                                              	push   ebx
  6f4825:	52                                              	push   edx
  6f4826:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f482c:	8b ce                                           	mov    ecx,esi
  6f482e:	e8 6d a6 da ff                                  	call   0x49eea0
  6f4833:	a1 ec 11 ac 00                                  	mov    eax,ds:0xac11ec
  6f4838:	33 ed                                           	xor    ebp,ebp
  6f483a:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  6f483c:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  6f4840:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  6f4843:	a1 cc 10 ac 00                                  	mov    eax,ds:0xac10cc
  6f4848:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  6f484c:	3b c3                                           	cmp    eax,ebx
  6f484e:	7e 4c                                           	jle    0x6f489c
  6f4850:	33 c0                                           	xor    eax,eax
  6f4852:	8b 0d 0c 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac100c
  6f4858:	50                                              	push   eax
  6f4859:	53                                              	push   ebx
  6f485a:	50                                              	push   eax
  6f485b:	50                                              	push   eax
  6f485c:	68 e8 03 00 00                                  	push   0x3e8
  6f4861:	50                                              	push   eax
  6f4862:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f4868:	50                                              	push   eax
  6f4869:	50                                              	push   eax
  6f486a:	68 00 04 00 00                                  	push   0x400
  6f486f:	8d 44 24 34                                     	lea    eax,[esp+0x34]
  6f4873:	57                                              	push   edi
  6f4874:	50                                              	push   eax
  6f4875:	6a 00                                           	push   0x0
  6f4877:	51                                              	push   ecx
  6f4878:	8b ce                                           	mov    ecx,esi
  6f487a:	e8 21 a6 da ff                                  	call   0x49eea0
  6f487f:	8b 15 ec 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11ec
  6f4885:	8b 42 0c                                        	mov    eax,DWORD PTR [edx+0xc]
  6f4888:	8b 54 24 14                                     	mov    edx,DWORD PTR [esp+0x14]
  6f488c:	03 d0                                           	add    edx,eax
  6f488e:	a1 cc 10 ac 00                                  	mov    eax,ds:0xac10cc
  6f4893:	45                                              	inc    ebp
  6f4894:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  6f4898:	3b e8                                           	cmp    ebp,eax
  6f489a:	7c b4                                           	jl     0x6f4850
  6f489c:	a1 f0 11 ac 00                                  	mov    eax,ds:0xac11f0
  6f48a1:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  6f48a3:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  6f48a7:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  6f48aa:	33 c9                                           	xor    ecx,ecx
  6f48ac:	33 c0                                           	xor    eax,eax
  6f48ae:	51                                              	push   ecx
  6f48af:	50                                              	push   eax
  6f48b0:	51                                              	push   ecx
  6f48b1:	51                                              	push   ecx
  6f48b2:	68 e8 03 00 00                                  	push   0x3e8
  6f48b7:	51                                              	push   ecx
  6f48b8:	51                                              	push   ecx
  6f48b9:	51                                              	push   ecx
  6f48ba:	68 00 04 00 00                                  	push   0x400
  6f48bf:	8d 44 24 34                                     	lea    eax,[esp+0x34]
  6f48c3:	57                                              	push   edi
  6f48c4:	50                                              	push   eax
  6f48c5:	51                                              	push   ecx
  6f48c6:	8b 0d 94 10 ac 00                               	mov    ecx,DWORD PTR ds:0xac1094
  6f48cc:	89 54 24 44                                     	mov    DWORD PTR [esp+0x44],edx
  6f48d0:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f48d6:	51                                              	push   ecx
  6f48d7:	8b ce                                           	mov    ecx,esi
  6f48d9:	e8 c2 a5 da ff                                  	call   0x49eea0
  6f48de:	a1 f4 11 ac 00                                  	mov    eax,ds:0xac11f4
  6f48e3:	33 c9                                           	xor    ecx,ecx
  6f48e5:	51                                              	push   ecx
  6f48e6:	8b 10                                           	mov    edx,DWORD PTR [eax]
  6f48e8:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  6f48ec:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  6f48ef:	89 44 24 18                                     	mov    DWORD PTR [esp+0x18],eax
  6f48f3:	33 c0                                           	xor    eax,eax
  6f48f5:	50                                              	push   eax
  6f48f6:	51                                              	push   ecx
  6f48f7:	8b 15 58 10 ac 00                               	mov    edx,DWORD PTR ds:0xac1058
  6f48fd:	51                                              	push   ecx
  6f48fe:	68 e8 03 00 00                                  	push   0x3e8
  6f4903:	51                                              	push   ecx
  6f4904:	51                                              	push   ecx
  6f4905:	51                                              	push   ecx
  6f4906:	68 00 04 00 00                                  	push   0x400
  6f490b:	8d 4c 24 34                                     	lea    ecx,[esp+0x34]
  6f490f:	57                                              	push   edi
  6f4910:	51                                              	push   ecx
  6f4911:	50                                              	push   eax
  6f4912:	52                                              	push   edx
  6f4913:	8b 15 a4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11a4
  6f4919:	8b ce                                           	mov    ecx,esi
  6f491b:	e8 80 a5 da ff                                  	call   0x49eea0

; 0x49eea0 <= VA < 0x49efed: Blitter Point and SHP frame rectangle inputs.
  49eea0:	83 ec 6c                                        	sub    esp,0x6c
  49eea3:	53                                              	push   ebx
  49eea4:	8b 5c 24 74                                     	mov    ebx,DWORD PTR [esp+0x74]
  49eea8:	85 db                                           	test   ebx,ebx
  49eeaa:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  49eeae:	89 4c 24 14                                     	mov    DWORD PTR [esp+0x14],ecx
  49eeb2:	0f 84 dc 04 00 00                               	je     0x49f394
  49eeb8:	8b 84 24 88 00 00 00                            	mov    eax,DWORD PTR [esp+0x88]
  49eebf:	55                                              	push   ebp
  49eec0:	8b 6c 24 7c                                     	mov    ebp,DWORD PTR [esp+0x7c]
  49eec4:	89 82 7c 01 00 00                               	mov    DWORD PTR [edx+0x17c],eax
  49eeca:	8b 84 24 80 00 00 00                            	mov    eax,DWORD PTR [esp+0x80]
  49eed1:	56                                              	push   esi
  49eed2:	57                                              	push   edi
  49eed3:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  49eed5:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  49eed8:	0f bf 43 06                                     	movsx  eax,WORD PTR [ebx+0x6]
  49eedc:	3b e8                                           	cmp    ebp,eax
  49eede:	89 8c 24 88 00 00 00                            	mov    DWORD PTR [esp+0x88],ecx
  49eee5:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  49eee9:	73 37                                           	jae    0x49ef22
  49eeeb:	8d 4c 6d 00                                     	lea    ecx,[ebp+ebp*2+0x0]
  49eeef:	8d 44 cb 08                                     	lea    eax,[ebx+ecx*8+0x8]
  49eef3:	85 c0                                           	test   eax,eax
  49eef5:	74 2b                                           	je     0x49ef22
  49eef7:	0f bf 50 06                                     	movsx  edx,WORD PTR [eax+0x6]
  49eefb:	0f bf 48 04                                     	movsx  ecx,WORD PTR [eax+0x4]
  49eeff:	52                                              	push   edx
  49ef00:	51                                              	push   ecx
  49ef01:	0f bf 50 02                                     	movsx  edx,WORD PTR [eax+0x2]
  49ef05:	0f bf 00                                        	movsx  eax,WORD PTR [eax]
  49ef08:	52                                              	push   edx
  49ef09:	50                                              	push   eax
  49ef0a:	8d 4c 24 5c                                     	lea    ecx,[esp+0x5c]
  49ef0e:	e8 bd cd f8 ff                                  	call   0x42bcd0
  49ef13:	8b d0                                           	mov    edx,eax
  49ef15:	8b 02                                           	mov    eax,DWORD PTR [edx]
  49ef17:	8b 4a 04                                        	mov    ecx,DWORD PTR [edx+0x4]
  49ef1a:	8b 72 08                                        	mov    esi,DWORD PTR [edx+0x8]
  49ef1d:	8b 7a 0c                                        	mov    edi,DWORD PTR [edx+0xc]
  49ef20:	eb 17                                           	jmp    0x49ef39
  49ef22:	a1 50 29 85 00                                  	mov    eax,ds:0x852950
  49ef27:	8b 0d 54 29 85 00                               	mov    ecx,DWORD PTR ds:0x852954
  49ef2d:	8b 35 58 29 85 00                               	mov    esi,DWORD PTR ds:0x852958
  49ef33:	8b 3d 5c 29 85 00                               	mov    edi,DWORD PTR ds:0x85295c
  49ef39:	89 44 24 2c                                     	mov    DWORD PTR [esp+0x2c],eax
  49ef3d:	89 4c 24 30                                     	mov    DWORD PTR [esp+0x30],ecx
  49ef41:	0f bf 43 06                                     	movsx  eax,WORD PTR [ebx+0x6]
  49ef45:	3b e8                                           	cmp    ebp,eax
  49ef47:	89 74 24 34                                     	mov    DWORD PTR [esp+0x34],esi
  49ef4b:	89 7c 24 38                                     	mov    DWORD PTR [esp+0x38],edi
  49ef4f:	73 18                                           	jae    0x49ef69
  49ef51:	8d 4c 6d 00                                     	lea    ecx,[ebp+ebp*2+0x0]
  49ef55:	8d 44 cb 08                                     	lea    eax,[ebx+ecx*8+0x8]
  49ef59:	85 c0                                           	test   eax,eax
  49ef5b:	74 0c                                           	je     0x49ef69
  49ef5d:	8b 40 14                                        	mov    eax,DWORD PTR [eax+0x14]
  49ef60:	85 c0                                           	test   eax,eax
  49ef62:	74 05                                           	je     0x49ef69
  49ef64:	8d 2c 18                                        	lea    ebp,[eax+ebx*1]
  49ef67:	eb 02                                           	jmp    0x49ef6b
  49ef69:	33 ed                                           	xor    ebp,ebp
  49ef6b:	0f bf 53 02                                     	movsx  edx,WORD PTR [ebx+0x2]
  49ef6f:	0f bf 43 04                                     	movsx  eax,WORD PTR [ebx+0x4]
  49ef73:	57                                              	push   edi
  49ef74:	56                                              	push   esi
  49ef75:	8d 4c 24 64                                     	lea    ecx,[esp+0x64]
  49ef79:	89 54 24 1c                                     	mov    DWORD PTR [esp+0x1c],edx
  49ef7d:	89 44 24 20                                     	mov    DWORD PTR [esp+0x20],eax
  49ef81:	e8 aa 04 00 00                                  	call   0x49f430
  49ef86:	0f af f7                                        	imul   esi,edi
  49ef89:	56                                              	push   esi
  49ef8a:	55                                              	push   ebp
  49ef8b:	8d 4c 24 78                                     	lea    ecx,[esp+0x78]
  49ef8f:	c7 44 24 74 01 00 00 00                         	mov    DWORD PTR [esp+0x74],0x1
  49ef97:	e8 24 93 f9 ff                                  	call   0x4382c0
  49ef9c:	c7 44 24 5c f8 ae 79 00                         	mov    DWORD PTR [esp+0x5c],0x79aef8
  49efa4:	8b 8c 24 a4 00 00 00                            	mov    ecx,DWORD PTR [esp+0xa4]
  49efab:	8b 9c 24 ac 00 00 00                            	mov    ebx,DWORD PTR [esp+0xac]
  49efb2:	8b b4 24 b0 00 00 00                            	mov    esi,DWORD PTR [esp+0xb0]
  49efb9:	89 5c 24 24                                     	mov    DWORD PTR [esp+0x24],ebx
  49efbd:	85 c9                                           	test   ecx,ecx
  49efbf:	89 74 24 28                                     	mov    DWORD PTR [esp+0x28],esi
  49efc3:	0f 84 10 01 00 00                               	je     0x49f0d9
  49efc9:	0f bf 51 06                                     	movsx  edx,WORD PTR [ecx+0x6]
  49efcd:	8b 84 24 a8 00 00 00                            	mov    eax,DWORD PTR [esp+0xa8]
  49efd4:	3b c2                                           	cmp    eax,edx
  49efd6:	73 36                                           	jae    0x49f00e
  49efd8:	8d 04 40                                        	lea    eax,[eax+eax*2]
  49efdb:	8d 44 c1 08                                     	lea    eax,[ecx+eax*8+0x8]
  49efdf:	85 c0                                           	test   eax,eax
  49efe1:	74 2b                                           	je     0x49f00e
  49efe3:	0f bf 48 06                                     	movsx  ecx,WORD PTR [eax+0x6]
  49efe7:	0f bf 50 04                                     	movsx  edx,WORD PTR [eax+0x4]
  49efeb:	51                                              	push   ecx
  49efec:	52                                              	push   edx

; 0x49f10a <= VA < 0x49f197: Blitter0x200 centers; supplied0x400 does not. Frame crop offsets added to Point.
  49f10a:	8b 84 24 90 00 00 00                            	mov    eax,DWORD PTR [esp+0x90]
  49f111:	f6 c4 02                                        	test   ah,0x2
  49f114:	74 30                                           	je     0x49f146
  49f116:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  49f11a:	8b ac 24 88 00 00 00                            	mov    ebp,DWORD PTR [esp+0x88]
  49f121:	99                                              	cdq
  49f122:	2b c2                                           	sub    eax,edx
  49f124:	d1 f8                                           	sar    eax,1
  49f126:	f7 d8                                           	neg    eax
  49f128:	03 e8                                           	add    ebp,eax
  49f12a:	8b 44 24 18                                     	mov    eax,DWORD PTR [esp+0x18]
  49f12e:	99                                              	cdq
  49f12f:	2b c2                                           	sub    eax,edx
  49f131:	8b 54 24 10                                     	mov    edx,DWORD PTR [esp+0x10]
  49f135:	d1 f8                                           	sar    eax,1
  49f137:	f7 d8                                           	neg    eax
  49f139:	03 d0                                           	add    edx,eax
  49f13b:	89 ac 24 88 00 00 00                            	mov    DWORD PTR [esp+0x88],ebp
  49f142:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  49f146:	8b 7c 24 2c                                     	mov    edi,DWORD PTR [esp+0x2c]
  49f14a:	8b 6c 24 30                                     	mov    ebp,DWORD PTR [esp+0x30]
  49f14e:	85 c9                                           	test   ecx,ecx
  49f150:	74 27                                           	je     0x49f179
  49f152:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  49f156:	99                                              	cdq
  49f157:	2b c2                                           	sub    eax,edx
  49f159:	8b c8                                           	mov    ecx,eax
  49f15b:	8b 44 24 18                                     	mov    eax,DWORD PTR [esp+0x18]
  49f15f:	99                                              	cdq
  49f160:	d1 f9                                           	sar    ecx,1
  49f162:	2b c2                                           	sub    eax,edx
  49f164:	2b cf                                           	sub    ecx,edi
  49f166:	d1 f8                                           	sar    eax,1
  49f168:	2b c5                                           	sub    eax,ebp
  49f16a:	2b d9                                           	sub    ebx,ecx
  49f16c:	8b 8c 24 a4 00 00 00                            	mov    ecx,DWORD PTR [esp+0xa4]
  49f173:	89 5c 24 24                                     	mov    DWORD PTR [esp+0x24],ebx
  49f177:	2b f0                                           	sub    esi,eax
  49f179:	8b 54 24 10                                     	mov    edx,DWORD PTR [esp+0x10]
  49f17d:	8b 9c 24 88 00 00 00                            	mov    ebx,DWORD PTR [esp+0x88]
  49f184:	03 d5                                           	add    edx,ebp
  49f186:	03 df                                           	add    ebx,edi
  49f188:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  49f18c:	33 d2                                           	xor    edx,edx
  49f18e:	3b ca                                           	cmp    ecx,edx
  49f190:	89 9c 24 88 00 00 00                            	mov    DWORD PTR [esp+0x88],ebx
