package com.rinha.backend.controller

import com.fasterxml.jackson.databind.exc.InvalidFormatException
import com.rinha.backend.model.Pessoa
import com.rinha.backend.respository.PessoaRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*
import java.util.stream.Collectors

@RestController
@RequestMapping("/pessoas")
class PessoaController(@Autowired private val pessoaRepository: PessoaRepository) {
  @GetMapping("")
  fun getAllPessoas(@RequestParam("t") query: Optional<String>): ResponseEntity<List<PessoaResponse>> {
    if (query.isEmpty()) {
      throw InvalidFormatException("Parametro não informado", "", Pessoa::class.java)
    }

    val pessoas = pessoaRepository.findBySearchableIgnoreCaseContaining(query.get(), PageRequest.of(0, 50))

    return ResponseEntity(
      pessoas?.stream()?.map { p -> PessoaResponse(p) }?.collect(Collectors.toList())?.toList(),
      HttpStatus.OK
    )
  }

  @PostMapping("")
  fun createPessoa(@RequestBody request: PessoaRequest): ResponseEntity<Void> {
    val pessoaModel = Pessoa(
      UUID.randomUUID().toString(),
      request.apelido,
      request.nome,
      request.nascimento,
      request.stack?.joinToString(separator = " | "),
      arrayOf(request.apelido, request.nome, request.stack?.joinToString(separator = " | ")).joinToString(separator = " || ")
    )
    val createdPessoa = pessoaRepository.save(pessoaModel)

    val headers: HttpHeaders = HttpHeaders()
    headers.add("Location", "/pessoas/" + createdPessoa.id)
    
    return ResponseEntity(null, headers, HttpStatus.CREATED)
  }

  @GetMapping("/{id}")
  fun getPessoaById(@PathVariable("id") pessoaId: String): ResponseEntity<PessoaResponse> {
    val pessoa = pessoaRepository.findById(pessoaId).orElse(null)
    return if (pessoa != null) ResponseEntity(PessoaResponse(pessoa), HttpStatus.OK)
    else ResponseEntity(HttpStatus.NOT_FOUND)
  }
}
